const nodemailer = require("nodemailer");

const hasBrevo = () => process.env.BREVO_API_KEY && process.env.MAIL_FROM;
const hasSmtp = () => process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

async function sendViaBrevo({ to, subject, text }) {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "api-key": process.env.BREVO_API_KEY,
            "content-type": "application/json",
            accept: "application/json",
        },
        body: JSON.stringify({
            sender: {
                name: process.env.MAIL_FROM_NAME || "DYPConnect",
                email: process.env.MAIL_FROM,
            },
            to: [{ email: to }],
            subject,
            textContent: text,
        }),
    });

    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Brevo API error ${response.status}: ${detail}`);
    }
}

async function sendViaSmtp({ to, subject, text }) {
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

async function sendEmail({ to, subject, text }) {
    if (hasBrevo()) return sendViaBrevo({ to, subject, text });
    if (hasSmtp()) return sendViaSmtp({ to, subject, text });

    if (process.env.NODE_ENV === "production") {
        throw new Error("No email service is configured.");
    }

    // Development fallback: no email service yet, so print the email here instead
    console.log("\n--- EMAIL (no email service configured, printing instead) ---");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(text);
    console.log("---------------------------------------------------------------\n");
}

module.exports = sendEmail;