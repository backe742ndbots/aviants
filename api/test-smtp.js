import nodemailer from "nodemailer";

function createTransporter(smtpEmail, smtpPassword) {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpEmail,
      pass: smtpPassword,
    },
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { smtp_email, smtp_password } = req.body || {};

  if (!smtp_email || !smtp_password) {
    return res.status(400).json({ error: "smtp_email and smtp_password are required" });
  }

  const transporter = createTransporter(smtp_email, smtp_password);

  try {
    await transporter.verify();
    return res.status(200).json({ success: true, message: "SMTP credentials verified!" });
  } catch (err) {
    console.error("SMTP verification failed:", err.message);
    return res.status(401).json({ error: `SMTP Error: ${err.message}` });
  }
}
