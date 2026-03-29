import express from "express";
import { addPost, getFeedPosts, likePost, deletePost } from "../controllers/postController.js";
import { protect } from "../middlewares/auth.js";
import { upload } from "../configs/multer.js";

const postRouter = express.Router();

postRouter.post("/add", upload.array("images", 4), protect, addPost);

postRouter.get("/feed", protect, getFeedPosts);

postRouter.post("/like/:postId", protect, likePost);

postRouter.delete("/delete/:postId", protect, deletePost);

export default postRouter;
