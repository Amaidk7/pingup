import express from "express";
import { upload } from "../configs/multer.js";
import { protect } from "../middlewares/auth.js";
import { addUserStory, getStories, deleteStory } from "../controllers/storyControllers.js";

const storyRouter = express.Router();

storyRouter.post('/create', upload.single('media'), protect, addUserStory);
storyRouter.get('/get', protect, getStories);

// ✅ delete story
storyRouter.delete('/delete/:storyId', protect, deleteStory);

export default storyRouter;
