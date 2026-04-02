import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { addUser, getUsers, hashPassword, saveUsers } from "@/lib/storage";
import { DashboardUser, UserRole } from "@/lib/types";

function sanitizeUser(user: DashboardUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt
  };
}

function activeAdminCount(users: DashboardUser[]) {
  return users.filter((entry) => entry.role === "admin" && entry.isActive).length;
}

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await getUsers();
  return NextResponse.json({ users: users.map(sanitizeUser) });
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { name?: string; email?: string; password?: string; role?: UserRole };
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const targetRole = body.role === "admin" ? "admin" : "editor";
    if (body.role && body.role !== "admin" && body.role !== "editor") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const normalizedEmail = body.email.trim().toLowerCase();
    const normalizedPassword = body.password.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizedEmail)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (normalizedPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const created = await addUser({
      name: body.name.trim(),
      email: normalizedEmail,
      password: normalizedPassword,
      role: targetRole
    });

    return NextResponse.json({ user: sanitizeUser(created) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create user";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  const currentUser = await getUserFromRequest(request);
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      userId?: string;
      name?: string;
      email?: string;
      role?: UserRole;
      isActive?: boolean;
      newPassword?: string;
    };

    const userId = body.userId?.trim();
    if (!userId) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    const users = await getUsers();
    const index = users.findIndex((entry) => entry.id === userId);
    if (index < 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const target = users[index];
    const nextRole = body.role ?? target.role;
    const nextActive = typeof body.isActive === "boolean" ? body.isActive : target.isActive;
    const nextName = typeof body.name === "string" ? body.name.trim() : target.name;
    const nextEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : target.email;
    const nextPassword = typeof body.newPassword === "string" ? body.newPassword.trim() : "";

    if (nextRole !== "admin" && nextRole !== "editor") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (!nextName) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(nextEmail)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (users.some((entry) => entry.id !== userId && entry.email.toLowerCase() === nextEmail)) {
      return NextResponse.json({ error: "Email is already in use" }, { status: 400 });
    }
    if (nextPassword && nextPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    if (target.id === currentUser.id && nextActive === false) {
      return NextResponse.json({ error: "You cannot deactivate your own account" }, { status: 400 });
    }

    const willReduceActiveAdmins =
      target.role === "admin" &&
      target.isActive &&
      ((nextRole !== "admin" && target.id === userId) || nextActive === false);
    if (willReduceActiveAdmins && activeAdminCount(users) <= 1) {
      return NextResponse.json({ error: "At least one active admin is required" }, { status: 400 });
    }

    users[index] = {
      ...target,
      name: nextName,
      email: nextEmail,
      role: nextRole,
      isActive: nextActive,
      passwordHash: nextPassword ? hashPassword(nextPassword) : target.passwordHash
    };

    await saveUsers(users);
    return NextResponse.json({ user: sanitizeUser(users[index]) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update user";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const currentUser = await getUserFromRequest(request);
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { userId?: string };
    const userId = body.userId?.trim();
    if (!userId) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }
    if (userId === currentUser.id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    const users = await getUsers();
    const target = users.find((entry) => entry.id === userId);
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (target.role === "admin" && target.isActive && activeAdminCount(users) <= 1) {
      return NextResponse.json({ error: "At least one active admin is required" }, { status: 400 });
    }

    const nextUsers = users.filter((entry) => entry.id !== userId);
    await saveUsers(nextUsers);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete user";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
