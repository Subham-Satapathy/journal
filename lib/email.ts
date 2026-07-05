import nodemailer from "nodemailer";

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

export async function sendVerificationOtpEmail(email: string, otp: string) {
  const from = process.env.EMAIL_FROM || "support@pnlogix.com";
  const mailer = getTransporter();
  await mailer.sendMail({
    from,
    to: email,
    subject: "Verify your Pnlogix email",
    text: `Your Pnlogix verification code is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#0a0a0a;color:#f4f4f5;padding:24px;">
        <h2 style="margin:0 0 12px;">Verify your Pnlogix email</h2>
        <p style="margin:0 0 12px;color:#c4c4cc;">Use this OTP to complete signup:</p>
        <div style="font-size:28px;font-weight:700;letter-spacing:4px;margin:12px 0 18px;">${otp}</div>
        <p style="margin:0;color:#9f9fa9;">This code expires in 10 minutes.</p>
      </div>
    `,
  });
}
