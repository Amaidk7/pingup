import fs from "fs";
import imagekit from "../configs/imageKit.js";
import Message from "../models/Message.js";

//create an empty object to store ss event connections
const connections = {};

//controller functions for the sse endpoint

export const sseController = (req, res) => {
  const { userId } = req.params;
  console.log("New client connected : ", userId);

  //set sse headers

  res.setHeader("content-type", "text/event-stream");
  res.setHeader("cache-control", "no-cache");
  res.setHeader("connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  //add the client's response object to the connections object

  connections[userId] = res;

  //send an initial event to the client

  res.write("log: connected to SSE stream\n\n");

  //handle client disconnection

  req.on("close", () => {
    //remove the client's response object from the connections object
    delete connections[userId];
    console.log("Client disconnected");
  });
};

//send message

export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to_user_id, text } = req.body;
    const image = req.file;
    let media_url = "";
    let message_type = image ? "image" : "text";
    if (message_type === "image") {
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

    const message = {
      from_user_id: userId,
      to_user_id,
      text,
      media_url,
      message_type,
    };
    res.json({ success: true, message });

    //send message to to_user_id if they are connected to sse

    const messageWithUserData = await Message.findById(message._id).populate(
      "from_user_id",
    );
    if (connections[to_user_id]) {
      connections[to_user_id].write(
        `data: ${JSON.stringify(messageWithUserData)}\n\n`,
      );
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//get chat messages

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

    //mark messages as seen

    await Message.updateMany(
      {
        from_user_id: to_user_id,
        to_user_id: userId,
      },
      {
        seen: true,
      },
    );
    res.json({ success: true, messages });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getUserRecentMessages = async (req, res) => {
  try {
    const { userId } = req.auth();
    const messages = await Message.find({ to_user_id: userId })
      .populate("from_user_id to_user_id")
      .sort({ createdAt: -1 });

    res.json({ success: true, messages });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
