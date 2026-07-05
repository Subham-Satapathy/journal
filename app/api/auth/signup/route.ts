import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { issueEmailVerificationOtp } from "@/lib/email-verification";

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

    const exists = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, emailVerifiedAt: true, name: true },
    });
    if (exists) {
      if (!exists.emailVerifiedAt) {
        await issueEmailVerificationOtp(exists.id, exists.email);
        return NextResponse.json({
          user: { id: exists.id, email: exists.email, name: exists.name, emailVerified: false },
          requiresVerification: true,
          message: "Account exists but email is not verified. OTP sent again.",
        });
      }
      return NextResponse.json({ error: "Email is already registered." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
      select: { id: true, email: true, name: true, emailVerifiedAt: true },
    });

    await prisma.billingCustomer.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    await issueEmailVerificationOtp(user.id, user.email);

    return NextResponse.json(
      {
        user: { id: user.id, email: user.email, name: user.name, emailVerified: false },
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Signup failed." },
      { status: 500 }
    );
  }
}
