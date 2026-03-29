import express from "express";
import { upload } from "../configs/multer.js";
import { protect } from "../middlewares/auth.js";
import { addReel, getReels, likeReel, deleteReel } from "../controllers/reelController.js";

const reelRouter = express.Router();

reelRouter.post("/create", upload.single("video"), protect, addReel);

reelRouter.get("/get", protect, getReels);

reelRouter.post("/like/:reelId", protect, likeReel);

reelRouter.delete("/delete/:reelId", protect, deleteReel);

export default reelRouter;
