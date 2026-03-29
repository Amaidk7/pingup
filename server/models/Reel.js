import mongoose from "mongoose";

const reelSchema = new mongoose.Schema({
    user: { type: String, ref: 'User', required: true },
    caption: { type: String },
    video_url: { type: String, required: true },
    thumbnail_url: { type: String },
    likes_count: [{ type: String, ref: 'User' }],
}, { timestamps: true, minimize: false });

const Reel = mongoose.model('Reel', reelSchema);

export default Reel;
