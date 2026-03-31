import imagekit from "../configs/imageKit.js";
import { inngest } from "../inngest/index.js";
import Connection from "../models/Connection.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import fs from "fs";
import { clerkClient } from "@clerk/clerk-sdk-node";

// Get User Data using userId
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.auth();
    let user = await User.findById(userId);

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);
      const email = clerkUser.emailAddresses[0].emailAddress;
      const fullName = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`;

      user = await User.create({
        _id: userId,
        email: email,
        full_name: fullName || "New User",
        username: clerkUser.username || email.split("@")[0],
        profile_picture: clerkUser.imageUrl || "",
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update user Data
export const updateUserData = async (req, res) => {
  try {
    const { userId } = req.auth();
    let { username, full_name, bio, location } = req.body;

    const tempUser = await User.findById(userId);

    if (!tempUser) {
      return res.json({ success: false, message: "User not found" });
    }

    !username && (username = tempUser.username);

    if (tempUser.username !== username) {
      const user = await User.findOne({ username });
      if (user) username = tempUser.username;
    }

    const updatedData = { username, bio, location, full_name };

    const profile = req.files?.profile && req.files.profile[0];
    const cover = req.files?.cover && req.files.cover[0];

    if (profile) {
      const buffer = fs.readFileSync(profile.path);
      const response = await imagekit.upload({ file: buffer, fileName: profile.originalname });
      const url = imagekit.url({
        path: response.filePath,
        transformation: [{ quality: "auto" }, { format: "webp" }, { width: "512" }],
      });
      updatedData.profile_picture = url;
    }

    if (cover) {
      const buffer = fs.readFileSync(cover.path);
      const response = await imagekit.upload({ file: buffer, fileName: cover.originalname });
      const url = imagekit.url({
        path: response.filePath,
        transformation: [{ quality: "auto" }, { format: "webp" }, { width: "1280" }],
      });
      updatedData.cover_photo = url;
    }

    const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });

    res.json({ success: true, user, message: "Profile updated successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// find users
export const discoversUsers = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { input } = req.body;

    const allUsers = await User.find({
      $or: [
        { username: new RegExp(input, "i") },
        { email: new RegExp(input, "i") },
        { location: new RegExp(input, "i") },
        { full_name: new RegExp(input, "i") },
      ],
    });

    const filteredUsers = allUsers.filter((user) => user._id.toString() !== userId);

    res.json({ success: true, users: filteredUsers });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ FIXED: follow user
export const followUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    if (userId === id) {
      return res.json({ success: false, message: "You cannot follow yourself" });
    }

    const user = await User.findById(userId);
    const toUser = await User.findById(id);

    if (!user || !toUser) {
      return res.json({ success: false, message: "User not found" });
    }

    // ✅ String comparison fix — .toString() use karo
    const alreadyFollowing = user.following.some((f) => f.toString() === id.toString());

    if (alreadyFollowing) {
      return res.json({ success: false, message: "You are already following this user" });
    }

    // ✅ $addToSet use karo — duplicate kabhi nahi aayega
    await User.findByIdAndUpdate(userId, { $addToSet: { following: id } });
    await User.findByIdAndUpdate(id, { $addToSet: { followers: userId } });

    res.json({ success: true, message: "User followed successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ FIXED: unfollow user
export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    // ✅ $pull use karo — cleaner aur reliable
    await User.findByIdAndUpdate(userId, { $pull: { following: id } });
    await User.findByIdAndUpdate(id, { $pull: { followers: userId } });

    res.json({ success: true, message: "User unfollowed successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// send connection request
export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const connectionRequests = await Connection.find({
      from_user_id: userId,
      created_at: { $gt: last24Hours },
    });

    if (connectionRequests.length >= 20) {
      return res.json({
        success: false,
        message: "You have sent more than 20 connection requests in the last 24 hours.",
      });
    }

    const connection = await Connection.findOne({
      $or: [
        { from_user_id: userId, to_user_id: id },
        { from_user_id: id, to_user_id: userId },
      ],
    });

    if (!connection) {
      const newConnection = await Connection.create({
        from_user_id: userId,
        to_user_id: id,
      });

      await inngest.send({
        name: "app/connection-request",
        data: { connectionId: newConnection._id },
      });

      return res.json({ success: true, message: "Connection request sent successfully" });

    } else if (connection.status === "accepted") {
      return res.json({ success: false, message: "You are already connected with this user" });
    }

    return res.json({
      success: false,
      message: "Connection request already sent. Please wait for the user to accept.",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// get user connections
export const getUserConnections = async (req, res) => {
  try {
    const { userId } = req.auth();

    const user = await User.findById(userId).populate("connections followers following");

    const connections = user.connections;
    const followers = user.followers;
    const following = user.following;

    const pendingConnections = (
      await Connection.find({
        to_user_id: userId,
        status: "pending",
      }).populate("from_user_id")
    ).map((connection) => connection.from_user_id);

    res.json({ success: true, connections, pendingConnections, followers, following });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ FIXED: accept connection request
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const connection = await Connection.findOne({
      from_user_id: id,
      to_user_id: userId,
      status: "pending",
    });

    if (!connection) {
      return res.json({ success: false, message: "Connection request not found" });
    }

    // ✅ $addToSet — duplicate connections kabhi nahi banenga
    await User.findByIdAndUpdate(userId, { $addToSet: { connections: id } });
    await User.findByIdAndUpdate(id, { $addToSet: { connections: userId } });

    connection.status = "accepted";
    await connection.save();

    res.json({ success: true, message: "Connection request accepted successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// get user profiles
export const getUserProfiles = async (req, res) => {
  try {
    const { profileId } = req.body;

    const profile = await User.findById(profileId);

    if (!profile) {
      return res.json({ success: false, message: "Profile not found" });
    }

    const posts = await Post.find({ user: profileId }).populate("user");

    res.json({ success: true, profile, posts });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
