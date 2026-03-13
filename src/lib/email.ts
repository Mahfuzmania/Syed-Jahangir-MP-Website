import nodemailer from "nodemailer";
import { ContactSubmission } from "@/lib/types";

function canSendEmail() {
  return (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.CONTACT_EMAIL_TO
  );
}

export async function sendSubmissionEmail(payload: ContactSubmission) {
  if (!canSendEmail()) {
    return { sent: false, reason: "SMTP not configured" };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: process.env.CONTACT_EMAIL_TO,
    subject: `New Write-to-MP Submission: ${payload.subject || "No Subject"}`,
    text: [
      `Name: ${payload.name || "N/A"}`,
      `Phone: ${payload.phone}`,
      `Email: ${payload.email || "N/A"}`,
      `Category: ${payload.category}`,
      `Union/Ward: ${payload.unionWard}`,
      `Area: ${payload.area}`,
      `Consent Given: ${payload.consentGiven ? "Yes" : "No"}`,
      `Private Request: ${payload.isPrivate ? "Yes" : "No"}`,
      `Attachment: ${payload.attachmentUrl || "N/A"}`,
      `Message:`,
      payload.message
    ].join("\n")
  });

  return { sent: true };
}
