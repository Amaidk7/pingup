import imagekit from "../configs/imageKit.js";
import Reel from "../models/Reel.js";
import User from "../models/User.js";

// ✅ ImageKit auth params — frontend directly upload karega
export const getImageKitAuth = (req, res) => {
  try {
    const authParams = imagekit.getAuthenticationParameters();
    res.json({ ...authParams, publicKey: process.env.IMAGEKIT_PUBLIC_KEY });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ add reel — ab sirf URL save karega, file nahi aayegi
export const addReel = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { caption, video_url } = req.body;

    if (!video_url) {
      return res.json({ success: false, message: "Video URL is required" });
    }

    await Reel.create({
      user: userId,
      caption,
      video_url,
    });

    res.json({ success: true, message: "Reel uploaded successfully" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// get reels feed
export const getReels = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const userIds = [userId, ...(user.connections || []), ...(user.following || [])];

    const reels = await Reel.find({ user: { $in: userIds } })
      .populate("user")
      .sort({ createdAt: -1 });

    res.json({ success: true, reels });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// like reel
export const likeReel = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { reelId } = req.params;

    const reel = await Reel.findById(reelId);

    if (!reel) {
      return res.json({ success: false, message: "Reel not found" });
    }

    if (reel.likes_count.includes(userId)) {
      reel.likes_count = reel.likes_count.filter((id) => id !== userId);
      await reel.save();
      return res.json({ success: true, message: "Reel unliked" });
    } else {
      reel.likes_count.push(userId);
      await reel.save();
      return res.json({ success: true, message: "Reel liked" });
    }

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// delete reel
export const deleteReel = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { reelId } = req.params;

    const reel = await Reel.findById(reelId);

    if (!reel) {
      return res.json({ success: false, message: "Reel not found" });
    }

    if (reel.user.toString() !== userId) {
      return res.json({ success: false, message: "Unauthorized: You can only delete your own reels" });
    }

    await Reel.findByIdAndDelete(reelId);
    res.json({ success: true, message: "Reel deleted successfully" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

