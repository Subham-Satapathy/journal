import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashOtp, isOtpExpired } from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; otp?: string };
    const email = body.email?.trim().toLowerCase() ?? "";
    const otp = body.otp?.trim() ?? "";

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, emailVerifiedAt: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }
    if (user.emailVerifiedAt) {
      return NextResponse.json({ ok: true, alreadyVerified: true });
    }

    const latestOtp = await prisma.emailVerificationOtp.findFirst({
      where: { userId: user.id, consumedAt: null },
      orderBy: { createdAt: "desc" },
    });
    if (!latestOtp) {
      return NextResponse.json({ error: "No active OTP found. Please resend OTP." }, { status: 400 });
    }
    if (isOtpExpired(latestOtp.expiresAt)) {
      return NextResponse.json({ error: "OTP expired. Please resend OTP." }, { status: 400 });
    }

    const isValid = latestOtp.codeHash === hashOtp(otp);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid OTP." }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date() },
      }),
      prisma.emailVerificationOtp.updateMany({
        where: { userId: user.id, consumedAt: null },
        data: { consumedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ ok: true, verified: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Verification failed." },
      { status: 500 }
    );
  }
}
