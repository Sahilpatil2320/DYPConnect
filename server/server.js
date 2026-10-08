const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require("http");
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

const Message = require("./models/Message");
const Conversation = require("./models/Conversation");
const createNotification = require("./utils/createNotification");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim());

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "100kb" }));

// Limits repeated FAILED login/register attempts per IP.
// Successful requests are not counted, so a whole lab sharing one WiFi is not blocked.
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

const onlineUsers = new Map(); // userId -> socketId

io.on("connection", (socket) => {
    socket.on("register", (userId) => {
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;
    });

    socket.on("joinConversation", (conversationId) => {
        socket.join(conversationId);
    });

    socket.on("sendMessage", async ({ conversationId, text, senderId }) => {
        try {
            const message = await Message.create({
                conversation: conversationId,
                sender: senderId,
                text,
            });
            const populated = await message.populate("sender", "fullName");

            await Conversation.findByIdAndUpdate(conversationId, {
                lastMessage: text,
                lastMessageAt: new Date(),
            });

            io.to(conversationId).emit("newMessage", populated);

            const conversation = await Conversation.findById(conversationId);
            const recipientId = conversation.participants.find(
                (p) => p.toString() !== senderId
            );
            if (recipientId) {
                const sender = populated.sender;
                await createNotification({
                    recipient: recipientId,
                    sender: senderId,
                    type: "message",
                    text: `${sender.fullName} sent you a message`,
                });
            }
        } catch (err) {
            console.error("Error saving message:", err.message);
        }
    });

    socket.on("typing", ({ conversationId, userName }) => {
        socket.to(conversationId).emit("userTyping", userName);
    });

    socket.on("disconnect", () => {
        if (socket.userId) onlineUsers.delete(socket.userId);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});