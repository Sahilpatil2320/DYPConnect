const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { createPost, getFeed, toggleLike, addComment, getNewPostsExist, markFeedVisited } = require("../controllers/postController");

router.get("/", getFeed);
router.post("/", protect, createPost);
router.post("/:id/like", protect, toggleLike);
router.post("/:id/comment", protect, addComment);
router.get("/unseen-check", protect, getNewPostsExist);
router.put("/mark-visited", protect, markFeedVisited);

module.exports = router;