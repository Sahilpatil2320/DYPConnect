const nodemailer = require("nodemailer");

const isConfigured = () =>
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

async function sendEmail({ to, subject, text }) {
    if (!isConfigured()) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("Email service is not configured.");
        }
        // Development fallback: no email service yet, so print the email here instead
        console.log("\n--- EMAIL (SMTP not configured, printing instead) ---");
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(text);
        console.log("-----------------------------------------------------\n");
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to,
        subject,
        text,
    });
}

module.exports = sendEmail;