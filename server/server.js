import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";

import { inngest, functions } from "./inngest/index.js";

import { serve } from "inngest/express";

import { clerkMiddleware } from "@clerk/express";
import userRouter from "./routes/userRoutes.js";
import postRouter from "./routes/postRoutes.js";
import storyRouter from "./routes/storyRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import reelRouter from "./routes/reelRoutes.js";

const app = express();

await connectDB();

// ✅ Fix 1: CORS — frontend URL allow karo
app.use(cors({
  origin: [
    "https://ping-up-pied.vercel.app",
    "http://localhost:5173",  // local dev ke liye
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// ✅ Fix 2: 413 Error — payload size limit badhao (video/reel ke liye)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(clerkMiddleware());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/story", storyRouter);
app.use("/api/message", messageRouter);
app.use("/api/reel", reelRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
