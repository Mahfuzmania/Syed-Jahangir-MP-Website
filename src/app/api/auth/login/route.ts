import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_DURATION_SEC, createSession } from "@/lib/auth";
import { getUsers, hashPassword, needsPasswordRehash, saveUsers, verifyPassword } from "@/lib/storage";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimit";

const LOGIN_LIMIT = {
  windowMs: 10 * 60 * 1000,
  maxAttempts: 8,
  blockMs: 15 * 60 * 1000
};

function getClientIp(request: NextRequest) {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    if (!body.email || !body.password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const normalizedEmail = body.email.trim().toLowerCase();
    const ip = getClientIp(request);
    const limiterKey = `login:${ip}:${normalizedEmail}`;
    const limit = checkRateLimit(limiterKey, LOGIN_LIMIT);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
      );
    }

    const users = await getUsers();
    const userIndex = users.findIndex((entry) => entry.email.toLowerCase() === normalizedEmail);
    const user = userIndex >= 0 ? users[userIndex] : null;
    if (!user || !verifyPassword(body.password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    if (!user.isActive) {
      return NextResponse.json({ error: "Account is deactivated" }, { status: 403 });
    }

    if (needsPasswordRehash(user.passwordHash)) {
      users[userIndex] = { ...user, passwordHash: hashPassword(body.password) };
      await saveUsers(users);
    }

    const token = await createSession(user.id);
    const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name, role: user.role } });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_DURATION_SEC
    });
    resetRateLimit(limiterKey);

    return response;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
