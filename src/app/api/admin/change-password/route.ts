import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getUsers, saveUsers, hashPassword, verifyPassword } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { currentPassword?: string; newPassword?: string };
    const currentPassword = body.currentPassword?.trim() || "";
    const newPassword = body.newPassword?.trim() || "";

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const users = await getUsers();
    const index = users.findIndex((entry) => entry.id === user.id);
    if (index < 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentUser = users[index];
    if (!verifyPassword(currentPassword, currentUser.passwordHash)) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }

    users[index] = {
      ...currentUser,
      passwordHash: hashPassword(newPassword)
    };

    await saveUsers(users);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}
