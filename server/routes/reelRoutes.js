import express from "express";
import { protect } from "../middlewares/auth.js";
import { addReel, getReels, likeReel, deleteReel, getImageKitAuth } from "../controllers/reelController.js";

const reelRouter = express.Router();

// ✅ ImageKit auth — frontend directly upload karega
reelRouter.get("/imagekit-auth", protect, getImageKitAuth);

// ✅ multer hata diya — ab sirf URL aayega body mein
reelRouter.post("/create", protect, addReel);

reelRouter.get("/get", protect, getReels);

reelRouter.post("/like/:reelId", protect, likeReel);

reelRouter.delete("/delete/:reelId", protect, deleteReel);

export default reelRouter;
