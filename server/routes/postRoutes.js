const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
    createPost,
    getFeed,
    deletePost,
    toggleLike,
    addComment,
    getNewPostsExist,
    markFeedVisited,
} = require("../controllers/postController");

router.get("/", protect, getFeed);
router.get("/unseen-check", protect, getNewPostsExist);
router.put("/mark-visited", protect, markFeedVisited);
router.post("/", protect, createPost);
router.post("/:id/like", protect, toggleLike);
router.post("/:id/comment", protect, addComment);
router.delete("/:id", protect, deletePost);

module.exports = router;