const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const opportunityRoutes = require("./routes/opportunityRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const chatRoutes = require("./routes/chatRoutes");
const challengeRoutes = require("./routes/challengeRoutes");

const User = require("./models/User");
const Message = require("./models/Message");
const { getConversationIfMember } = require("./utils/chatAccess");

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;

connectDB();

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim());

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "100kb" }));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many failed attempts. Please try again in 15 minutes." },
});

app.get("/api/test", (req, res) => {
    res.json({ message: "DYPConnect backend is working!" });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/challenge", challengeRoutes);

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: allowedOrigins },
});

// Every socket must present a valid login token. The user's identity comes from
// the token, never from anything the browser sends afterwards.
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth && socket.handshake.auth.token;
        if (!token) return next(new Error("Authentication required."));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("fullName");
        if (!user) return next(new Error("User not found."));

        socket.userId = user._id.toString();
        socket.userName = user.fullName;
        next();
    } catch (err) {
        next(new Error("Invalid or expired token."));
    }
});

io.on("connection", (socket) => {
    // One private room per user. Messages are delivered to these rooms, so a user
    // receives everything meant for them, whichever chat they have open.
    socket.join(`user:${socket.userId}`);

    socket.on("sendMessage", async (payload) => {
        try {
            const { conversationId, text } = payload || {};
            const cleanText = typeof text === "string" ? text.trim() : "";
            if (!cleanText || cleanText.length > 2000) return;

            const conversation = await getConversationIfMember(conversationId, socket.userId);
            if (!conversation) return;

            const message = await Message.create({
                conversation: conversation._id,
                sender: socket.userId,
                text: cleanText,
            });
            const populated = await message.populate("sender", "fullName");

            conversation.lastMessage = cleanText.slice(0, 100);
            conversation.lastMessageAt = new Date();
            await conversation.save();

            conversation.participants.forEach((participantId) => {
                io.to(`user:${participantId}`).emit("newMessage", populated);
            });
        } catch (err) {
            console.error("Error saving message:", err.message);
        }
    });

    socket.on("typing", async (payload) => {
        try {
            const { conversationId } = payload || {};
            const conversation = await getConversationIfMember(conversationId, socket.userId);
            if (!conversation) return;

            conversation.participants
                .filter((p) => p.toString() !== socket.userId)
                .forEach((p) => {
                    io.to(`user:${p}`).emit("userTyping", {
                        conversationId,
                        userName: socket.userName,
                    });
                });
        } catch (err) {
            console.error("Typing event error:", err.message);
        }
    });

    socket.on("markRead", async (payload, ack) => {
        try {
            const { conversationId } = payload || {};
            const conversation = await getConversationIfMember(conversationId, socket.userId);
            if (conversation) {
                await Message.updateMany(
                    { conversation: conversation._id, sender: { $ne: socket.userId }, read: false },
                    { read: true }
                );
            }
        } catch (err) {
            console.error("Mark read error:", err.message);
        }
        if (typeof ack === "function") ack();
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});