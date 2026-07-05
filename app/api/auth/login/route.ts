import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { createSessionToken, getSessionCookieName, getSessionTtlSeconds } from "@/lib/session-token";

type LoginPayload = {
  email?: string;
  password?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LoginPayload;
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, passwordHash: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const token = await createSessionToken({ sub: user.id, email: user.email });
    const res = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
    res.cookies.set(getSessionCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: getSessionTtlSeconds(),
      path: "/",
    });
    return res;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login failed." },
      { status: 500 }
    );
  }
}
