import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE = "pnlogix_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export type SessionPayload = {
  sub: string;
  email: string;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) throw new Error("AUTH_SECRET is not configured.");
  return new TextEncoder().encode(secret);
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export function getSessionTtlSeconds() {
  return SESSION_TTL_SECONDS;
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());
}

export async function readSessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const verified = await jwtVerify(token, getSecret());
    const sub = String(verified.payload.sub ?? "");
    const email = String(verified.payload.email ?? "");
    if (!sub || !email) return null;
    return { sub, email };
  } catch {
    return null;
  }
}
