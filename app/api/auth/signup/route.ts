import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { createSessionToken, getSessionCookieName, getSessionTtlSeconds } from "@/lib/session-token";

type SignupPayload = {
  email?: string;
  password?: string;
  name?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SignupPayload;
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    const name = body.name?.trim() || null;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Email is already registered." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
      select: { id: true, email: true, name: true },
    });

    await prisma.billingCustomer.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    const token = await createSessionToken({ sub: user.id, email: user.email });
    const res = NextResponse.json({ user }, { status: 201 });
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
      { error: error instanceof Error ? error.message : "Signup failed." },
      { status: 500 }
    );
  }
}
