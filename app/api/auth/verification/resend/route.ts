import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { issueEmailVerificationOtp } from "@/lib/email-verification";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase() ?? "";
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, emailVerifiedAt: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }
    if (user.emailVerifiedAt) {
      return NextResponse.json({ error: "Email is already verified." }, { status: 400 });
    }

    await issueEmailVerificationOtp(user.id, user.email);
    return NextResponse.json({ ok: true, message: "Verification OTP sent." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to resend OTP." },
      { status: 400 }
    );
  }
}
