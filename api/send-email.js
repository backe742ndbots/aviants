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

  const { smtp_email, smtp_password, to, subject, body, from_name } = req.body || {};

  if (!smtp_email || !smtp_password || !to || !subject || !body) {
    return res.status(400).json({
      error: "Missing required fields: smtp_email, smtp_password, to, subject, body",
    });
  }

  const transporter = createTransporter(smtp_email, smtp_password);

  const mailOptions = {
    from: from_name ? `"${from_name}" <${smtp_email}>` : smtp_email,
    to,
    subject,
    html: body,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error("Failed to send email:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
