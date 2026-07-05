import { prisma } from "@/lib/prisma";
import { generateOtpCode, hashOtp } from "@/lib/otp";
import { sendVerificationOtpEmail } from "@/lib/email";

const OTP_TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;

export async function issueEmailVerificationOtp(userId: string, email: string) {
  const latest = await prisma.emailVerificationOtp.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (latest) {
    const elapsed = Math.floor((Date.now() - latest.createdAt.getTime()) / 1000);
    if (elapsed < RESEND_COOLDOWN_SECONDS) {
      const waitFor = RESEND_COOLDOWN_SECONDS - elapsed;
      throw new Error(`Please wait ${waitFor}s before requesting another OTP.`);
    }
  }

  const code = generateOtpCode();
  const codeHash = hashOtp(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.emailVerificationOtp.create({
    data: {
      userId,
      codeHash,
      expiresAt,
    },
  });

  await sendVerificationOtpEmail(email, code);
}
