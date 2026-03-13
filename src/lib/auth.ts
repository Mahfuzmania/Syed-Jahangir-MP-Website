import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { getSessions, getUsers, saveSessions } from "@/lib/storage";
import { DashboardUser } from "@/lib/types";

const SESSION_COOKIE = "mp_admin_session";
const SESSION_DURATION_SEC = 60 * 60 * 12;
const INSECURE_DEV_JWT_SECRET = "change-this-dev-jwt-secret";
let warnedAboutInsecureSecret = false;

type JwtPayload = {
  sub: string;
  sid: string;
  type: "admin_auth";
};

function getJwtSecret() {
  const fromEnv = process.env.JWT_SECRET?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production.");
  }
  if (!warnedAboutInsecureSecret) {
    console.warn("[SECURITY] JWT_SECRET is missing. Using insecure development fallback secret.");
    warnedAboutInsecureSecret = true;
  }
  return INSECURE_DEV_JWT_SECRET;
}

function pruneExpiredSessions(store: Record<string, { userId: string; expiresAt: string }>) {
  const now = Date.now();
  let changed = false;
  for (const [sessionId, session] of Object.entries(store)) {
    if (new Date(session.expiresAt).getTime() <= now) {
      delete store[sessionId];
      changed = true;
    }
  }
  return changed;
}

export async function createSession(userId: string) {
  const sid = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SEC * 1000).toISOString();

  const sessions = await getSessions();
  sessions[sid] = { userId, expiresAt };
  pruneExpiredSessions(sessions);
  await saveSessions(sessions);

  const token = jwt.sign({ sub: userId, sid, type: "admin_auth" } satisfies JwtPayload, getJwtSecret(), {
    expiresIn: SESSION_DURATION_SEC
  });
  return token;
}

export async function destroySession(token: string) {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    if (!decoded?.sid) {
      return;
    }
    const sessions = await getSessions();
    if (sessions[decoded.sid]) {
      delete sessions[decoded.sid];
      await saveSessions(sessions);
    }
  } catch {
    return;
  }
}

async function findUserById(id: string): Promise<DashboardUser | null> {
  const users = await getUsers();
  return users.find((u) => u.id === id && u.isActive) ?? null;
}

export async function getUserFromRequest(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  return getUserByToken(token);
}

export async function getUserFromCookieStore() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  return getUserByToken(token);
}

async function getUserByToken(token: string) {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    if (!decoded?.sub || !decoded?.sid || decoded.type !== "admin_auth") {
      return null;
    }

    const sessions = await getSessions();
    const changed = pruneExpiredSessions(sessions);
    const activeSession = sessions[decoded.sid];
    if (changed) {
      await saveSessions(sessions);
    }
    if (!activeSession || activeSession.userId !== decoded.sub) {
      return null;
    }
    return findUserById(decoded.sub);
  } catch {
    return null;
  }
}

export { SESSION_COOKIE, SESSION_DURATION_SEC };
