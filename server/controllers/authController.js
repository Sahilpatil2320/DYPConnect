const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = ["student", "teacher", "alumni"];

const COMMON_FIELDS = ["fullName", "email", "department"];
const ROLE_FIELDS = {
    student: ["year"],
    teacher: ["designation"],
    alumni: ["graduationYear", "currentCompany", "currentRole"],
};

const PASSWORD_RULE_MESSAGE =
    "Password must be at least 8 characters with one uppercase letter and one number.";

const asTrimmedString = (value) => (typeof value === "string" ? value.trim() : "");

const isStrongPassword = (password) =>
    password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);

exports.register = async (req, res) => {
    try {
        const role = req.body.role;
        if (!VALID_ROLES.includes(role)) {
            return res.status(400).json({ message: "Please select a valid role." });
        }

        // Copy only the fields we expect. Anything else the client sends is ignored.
        const expectedFields = [...COMMON_FIELDS, ...ROLE_FIELDS[role]];
        const data = { role };
        expectedFields.forEach((field) => {
            data[field] = asTrimmedString(req.body[field]);
        });
        data.email = data.email.toLowerCase();

        const password = typeof req.body.password === "string" ? req.body.password : "";

        if (data.fullName.length < 2 || data.fullName.length > 80) {
            return res.status(400).json({ message: "Please enter your full name." });
        }
        if (!EMAIL_REGEX.test(data.email)) {
            return res.status(400).json({ message: "Enter a valid email address." });
        }
        if (!isStrongPassword(password)) {
            return res.status(400).json({ message: PASSWORD_RULE_MESSAGE });
        }
        if (expectedFields.some((field) => !data[field])) {
            return res.status(400).json({ message: "Please fill in all required fields." });
        }

        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            return res.status(400).json({ message: "An account with this email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ ...data, password: hashedPassword });

        res.status(201).json({ message: "Account created successfully." });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "An account with this email already exists." });
        }
        console.error("Register error:", err.message);
        res.status(500).json({ message: "Server error during registration." });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !VALID_ROLES.includes(role)
        ) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase(), role });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        const userToSend = user.toObject();
        delete userToSend.password;

        res.json({ token, user: userToSend });
    } catch (err) {
        console.error("Login error:", err.message);
        res.status(500).json({ message: "Server error during login." });
    }
};

exports.forgotPassword = async (req, res) => {
    // Same reply whether or not the account exists, so this form can't be used
    // to discover which emails are registered.
    const genericReply = {
        message: "If an account exists for that email, we've sent a password reset link.",
    };

    try {
        const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ message: "Enter a valid email address." });
        }

        const user = await User.findOne({ email });
        if (!user) return res.json(genericReply);

        // The raw token goes in the email. Only a hash of it is stored in the database.
        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    passwordResetToken: hashedToken,
                    passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
                },
            }
        );

        const baseUrl = (process.env.CLIENT_URL || "http://localhost:5173").split(",")[0].trim();
        const resetLink = `${baseUrl}/reset-password/${rawToken}`;

        try {
            await sendEmail({
                to: user.email,
                subject: "Reset your DYPConnect password",
                text:
                    `Hi ${user.fullName},\n\n` +
                    `Use the link below to set a new password. It expires in 1 hour.\n\n` +
                    `${resetLink}\n\n` +
                    `If you didn't request this, you can ignore this email.`,
            });
        } catch (mailErr) {
            // Logged here only, so the reply to the browser stays identical either way
            console.error("Could not send reset email:", mailErr.message);
        }

        res.json(genericReply);
    } catch (err) {
        console.error("Forgot password error:", err.message);
        res.status(500).json({ message: "Could not process the request. Please try again." });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const token = typeof req.params.token === "string" ? req.params.token : "";
        const password = typeof req.body.password === "string" ? req.body.password : "";

        if (!isStrongPassword(password)) {
            return res.status(400).json({ message: PASSWORD_RULE_MESSAGE });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({ message: "This reset link is invalid or has expired." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.updateOne(
            { _id: user._id },
            {
                $set: { password: hashedPassword },
                $unset: { passwordResetToken: "", passwordResetExpires: "" },
            }
        );

        res.json({ message: "Password updated. You can now log in." });
    } catch (err) {
        console.error("Reset password error:", err.message);
        res.status(500).json({ message: "Could not reset the password. Please try again." });
    }
};