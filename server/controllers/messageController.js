import fs from "fs";
import imagekit from "../configs/imageKit.js";
import Message from "../models/Message.js";

// create an empty object to store sse event connections
const connections = {};

// SSE endpoint
export const sseController = (req, res) => {
  const { userId } = req.params;

  console.log("New client connected :", userId);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  connections[userId] = res;

  // initial event (JSON format)
  res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

  req.on("close", () => {
    delete connections[userId];
    console.log("Client disconnected");
  });
};

// send message
export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to_user_id, text } = req.body;
    const image = req.file;

    let media_url = "";
    let message_type = image ? "image" : "text";

    if (image) {
      const fileBuffer = fs.readFileSync(image.path);

      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: image.originalname,
      });

      media_url = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "1280" },
        ],
      });
    }

    // save message in database
    const message = await Message.create({
      from_user_id: userId,
      to_user_id,
      text,
      media_url,
      message_type,
    });

    res.json({
      success: true,
      message,
    });

    // populate sender info
    const messageWithUserData = await Message.findById(message._id).populate(
      "from_user_id"
    );

    // send realtime message if receiver connected
    if (connections[to_user_id]) {
      connections[to_user_id].write(
        `data: ${JSON.stringify(messageWithUserData)}\n\n`
      );
    }

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// get chat messages
export const getChatMessages = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to_user_id } = req.body;

    const messages = await Message.find({
      $or: [
        { from_user_id: userId, to_user_id },
        { from_user_id: to_user_id, to_user_id: userId },
      ],
    }).sort({ createdAt: 1 });

    // mark messages as seen
    await Message.updateMany(
      {
        from_user_id: to_user_id,
        to_user_id: userId,
      },
      { seen: true }
    );

    res.json({
      success: true,
      messages,
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// get recent messages
export const getUserRecentMessages = async (req, res) => {
  try {
    const { userId } = req.auth();

    const messages = await Message.find({
      to_user_id: userId,
    })
      .populate("from_user_id to_user_id")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      messages,
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};