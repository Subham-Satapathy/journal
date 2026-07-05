import crypto from "crypto";

export function generateOtpCode() {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

export function hashOtp(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export function isOtpExpired(expiresAt: Date) {
  return expiresAt.getTime() <= Date.now();
}
