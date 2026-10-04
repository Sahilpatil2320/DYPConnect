const Post = require("../models/Post");
const createNotification = require("../utils/createNotification");

exports.createPost = async (req, res) => {
    try {
        const post = await Post.create({
            author: req.userId,
            content: req.body.content,
        });
        const populated = await post.populate("author", "fullName role department");
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: "Error creating post.", error: err.message });
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
        res.status(500).json({ message: "Error fetching feed.", error: err.message });
    }
};

exports.toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate("author", "fullName");
        if (!post) return res.status(404).json({ message: "Post not found." });

        const alreadyLiked = post.likes.includes(req.userId);
        if (alreadyLiked) {
            post.likes = post.likes.filter((id) => id.toString() !== req.userId);
        } else {
            post.likes.push(req.userId);
            const liker = await require("../models/User").findById(req.userId).select("fullName");
            await createNotification({
                recipient: post.author._id,
                sender: req.userId,
                type: "like",
                text: `${liker.fullName} liked your post`,
            });
        }

        await post.save();
        res.json({ likes: post.likes });
    } catch (err) {
        res.status(500).json({ message: "Error updating like.", error: err.message });
    }
};

exports.addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found." });

        post.comments.push({ author: req.userId, text: req.body.text });
        await post.save();

        const populated = await post.populate("comments.author", "fullName");

        const commenter = await require("../models/User").findById(req.userId).select("fullName");
        await createNotification({
            recipient: post.author,
            sender: req.userId,
            type: "comment",
            text: `${commenter.fullName} commented on your post: "${req.body.text.slice(0, 40)}${req.body.text.length > 40 ? "..." : ""}"`,
        });

        res.status(201).json(populated.comments);
    } catch (err) {
        res.status(500).json({ message: "Error adding comment.", error: err.message });
    }
};