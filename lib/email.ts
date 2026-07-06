import nodemailer from "nodemailer";
import { getSiteUrl } from "@/lib/site";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP credentials are not configured.");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter;
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderEmailLayout({
  title,
  subtitle,
  bodyHtml,
}: {
  title: string;
  subtitle?: string;
  bodyHtml: string;
}) {
  const siteUrl = getSiteUrl();
  const logoUrl = `${siteUrl}/logo.png?v=20260706t1823`;
  const safeTitle = escapeHtml(title);
  const safeSubtitle = subtitle ? escapeHtml(subtitle) : "";

  return `
    <div style="background:#09090b;padding:24px 12px;font-family:Inter,Segoe UI,Arial,sans-serif;">
      <div style="max-width:560px;margin:0 auto;background:#111114;border:1px solid #27272a;border-radius:16px;overflow:hidden;color:#f4f4f5;">
        <div style="padding:20px 24px;background:linear-gradient(135deg,#18181b,#111827);border-bottom:1px solid #27272a;">
          <img src="${logoUrl}" alt="Pnlogix" width="130" style="display:block;height:auto;" />
        </div>
        <div style="padding:24px;">
          <h2 style="margin:0 0 8px;font-size:22px;line-height:1.3;color:#fafafa;">${safeTitle}</h2>
          ${
            safeSubtitle
              ? `<p style="margin:0 0 16px;color:#a1a1aa;font-size:14px;line-height:1.5;">${safeSubtitle}</p>`
              : ""
          }
          ${bodyHtml}
          <p style="margin:22px 0 0;color:#71717a;font-size:12px;line-height:1.5;">
            Need help? Reply to this email or contact support@pnlogix.com
          </p>
        </div>
      </div>
    </div>
  `;
}

export async function sendVerificationOtpEmail(email: string, otp: string) {
  const from = process.env.EMAIL_FROM || "support@pnlogix.com";
  const mailer = getTransporter();
  const safeOtp = escapeHtml(otp);
  await mailer.sendMail({
    from,
    to: email,
    subject: "Verify your Pnlogix email",
    text: `Your Pnlogix verification code is ${otp}. It expires in 10 minutes.`,
    html: renderEmailLayout({
      title: "Verify your Pnlogix email",
      subtitle: "Use the OTP below to complete your signup.",
      bodyHtml: `
        <div style="margin:8px 0 14px;padding:14px 16px;background:#0b1220;border:1px solid #1f2937;border-radius:12px;">
          <div style="font-size:30px;font-weight:700;letter-spacing:5px;text-align:center;color:#e5e7eb;">${safeOtp}</div>
        </div>
        <p style="margin:0;color:#9ca3af;font-size:13px;">This code expires in 10 minutes.</p>
      `,
    }),
  });
}

export async function sendPaymentReceiptEmail(input: {
  to: string;
  planName: string;
  billingCycle: string;
  amountUsd: number;
  paidAt: Date;
  membershipEndsAt: Date;
  transactionRef?: string | null;
}) {
  const from = process.env.EMAIL_FROM || "support@pnlogix.com";
  const mailer = getTransporter();
  const cycleLabel = input.billingCycle === "yearly" ? "Yearly" : "Monthly";
  const amount = `$${input.amountUsd.toFixed(2)} USD`;
  const paidOn = input.paidAt.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const membershipEnds = input.membershipEndsAt.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const txRef = input.transactionRef ? escapeHtml(input.transactionRef) : "N/A";
  const safePlanName = escapeHtml(input.planName);

  await mailer.sendMail({
    from,
    to: input.to,
    subject: `Pnlogix payment received - ${safePlanName} ${cycleLabel}`,
    text: [
      "Thank you for your payment.",
      `Plan: ${input.planName} (${cycleLabel})`,
      `Amount: ${amount}`,
      `Paid on: ${paidOn}`,
      `Membership active until: ${membershipEnds}`,
      `Transaction reference: ${input.transactionRef ?? "N/A"}`,
      "",
      "Your consistency is your edge. Keep journaling and compounding your progress.",
    ].join("\n"),
    html: renderEmailLayout({
      title: "Payment received. Membership updated.",
      subtitle:
        "Thank you for trusting Pnlogix. Your payment has been confirmed and your access is active.",
      bodyHtml: `
        <div style="margin:0 0 16px;padding:14px 16px;background:#052e16;border:1px solid #14532d;border-radius:12px;color:#dcfce7;">
          Keep going. Every reviewed trade sharpens your edge.
        </div>
        <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#a1a1aa;">Plan</td><td style="padding:8px 0;text-align:right;color:#f4f4f5;">${safePlanName} (${cycleLabel})</td></tr>
          <tr><td style="padding:8px 0;color:#a1a1aa;">Amount</td><td style="padding:8px 0;text-align:right;color:#f4f4f5;">${amount}</td></tr>
          <tr><td style="padding:8px 0;color:#a1a1aa;">Paid on</td><td style="padding:8px 0;text-align:right;color:#f4f4f5;">${escapeHtml(paidOn)}</td></tr>
          <tr><td style="padding:8px 0;color:#a1a1aa;">Membership active until</td><td style="padding:8px 0;text-align:right;color:#f4f4f5;">${escapeHtml(
            membershipEnds
          )}</td></tr>
          <tr><td style="padding:8px 0;color:#a1a1aa;">Transaction reference</td><td style="padding:8px 0;text-align:right;color:#f4f4f5;">${txRef}</td></tr>
        </table>
      `,
    }),
  });
}
