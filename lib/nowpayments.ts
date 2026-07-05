import crypto from "crypto";

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

function toTopLevelSortedJson(payload: unknown): string {
  const record = (payload ?? {}) as Record<string, JsonValue>;
  const keys = Object.keys(record).sort();
  return JSON.stringify(record, keys);
}

export function buildNowPaymentsSignature(payload: unknown, secret: string): string {
  const body = toTopLevelSortedJson(payload);
  return crypto.createHmac("sha512", secret.trim()).update(body).digest("hex");
}

export function isNowPaymentsSignatureValid(payload: unknown, signature: string | null, secret: string): boolean {
  if (!signature || !secret.trim()) return false;
  const expected = buildNowPaymentsSignature(payload, secret);
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature.trim());
  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function isSuccessfulPaymentStatus(status: string | undefined): boolean {
  const normalized = (status ?? "").toLowerCase();
  return normalized === "finished" || normalized === "confirmed";
}
