import express from "express";
import { createPost, deletePost, getFeedPosts, getUserPosts, likePost, postComment } from "../controllers.js/postController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import upload from "../config/multer.js";


const router = express.Router();

/* READ */
router.get("/all-posts", verifyToken, getFeedPosts);
router.get("/:userId/posts", verifyToken, getUserPosts);

/* Post */
router.post('/create-post', upload.single("file"), verifyToken, createPost);

/* UPDATE */
router.patch("/:postId/like", verifyToken, likePost);
router.post("/:postId/comment", verifyToken, postComment);

/* DELETE */
router.delete("/delete-post/:postId", verifyToken, deletePost);

export default router; 
