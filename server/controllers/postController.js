const mongoose = require("mongoose");
const Post = require("../models/Post");
const User = require("../models/User");
const Notification = require("../models/Notification");
const createNotification = require("../utils/createNotification");

const MAX_POST_LENGTH = 3000;
const MAX_COMMENT_LENGTH = 500;

exports.createPost = async (req, res) => {
    try {
        const content = typeof req.body.content === "string" ? req.body.content.trim() : "";
        if (!content) {
            return res.status(400).json({ message: "A post can't be empty." });
        }
        if (content.length > MAX_POST_LENGTH) {
            return res.status(400).json({ message: `Posts can be up to ${MAX_POST_LENGTH} characters.` });
        }

        const post = await Post.create({ author: req.userId, content });
        const populated = await post.populate("author", "fullName role department");
        res.status(201).json(populated);
    } catch (err) {
        console.error("Create post error:", err.message);
        res.status(500).json({ message: "Error creating post." });
    }
};

exports.getFeed = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "fullName role department")
            .populate("comments.author", "fullName")
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        console.error("Get feed error:", err.message);
        res.status(500).json({ message: "Error fetching feed." });
    }
};

exports.toggleLike = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: "Post not found." });
        }

        const post = await Post.findById(req.params.id).select("author likes");
        if (!post) return res.status(404).json({ message: "Post not found." });

        const alreadyLiked = post.likes.some((id) => id.toString() === req.userId);

        const update = alreadyLiked
            ? { $pull: { likes: req.userId } }
            : { $addToSet: { likes: req.userId } };
        const updated = await Post.findByIdAndUpdate(post._id, update, { new: true }).select("likes");

        if (alreadyLiked) {
            // Unliking removes the notification the author received
            await Notification.deleteOne({
                recipient: post.author,
                sender: req.userId,
                type: "like",
                post: post._id,
            });
        } else {
            const liker = await User.findById(req.userId).select("fullName");
            await createNotification({
                recipient: post.author,
                sender: req.userId,
                type: "like",
                post: post._id,
                text: `${liker.fullName} liked your post`,
            });
        }

        res.json({ likes: updated.likes });
    } catch (err) {
        console.error("Toggle like error:", err.message);
        res.status(500).json({ message: "Error updating like." });
    }
};

exports.addComment = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: "Post not found." });
        }

        const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
        if (!text) {
            return res.status(400).json({ message: "A comment can't be empty." });
        }
        if (text.length > MAX_COMMENT_LENGTH) {
            return res.status(400).json({ message: `Comments can be up to ${MAX_COMMENT_LENGTH} characters.` });
        }

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found." });

        post.comments.push({ author: req.userId, text });
        await post.save();

        const populated = await post.populate("comments.author", "fullName");

        const commenter = await User.findById(req.userId).select("fullName");
        await createNotification({
            recipient: post.author,
            sender: req.userId,
            type: "comment",
            post: post._id,
            text: `${commenter.fullName} commented on your post: "${text.slice(0, 40)}${text.length > 40 ? "..." : ""}"`,
        });

        res.status(201).json(populated.comments);
    } catch (err) {
        console.error("Add comment error:", err.message);
        res.status(500).json({ message: "Error adding comment." });
    }
};

exports.getNewPostsExist = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const newPost = await Post.findOne({
            createdAt: { $gt: user.lastVisitedFeed },
            author: { $ne: req.userId },
        });
        res.json({ hasNew: !!newPost });
    } catch (err) {
        console.error("Unseen posts check error:", err.message);
        res.status(500).json({ message: "Error checking new posts." });
    }
};

exports.markFeedVisited = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.userId, { lastVisitedFeed: new Date() });
        res.json({ message: "Marked as visited." });
    } catch (err) {
        console.error("Mark feed visited error:", err.message);
        res.status(500).json({ message: "Error marking visited." });
    }
};