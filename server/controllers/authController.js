const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = ["student", "teacher", "alumni"];

const COMMON_FIELDS = ["fullName", "email", "department"];
const ROLE_FIELDS = {
    student: ["year"],
    teacher: ["designation"],
    alumni: ["graduationYear", "currentCompany", "currentRole"],
};

const asTrimmedString = (value) => (typeof value === "string" ? value.trim() : "");

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
        if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters with one uppercase letter and one number.",
            });
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