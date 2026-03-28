import React, { useEffect, useRef, useState } from "react";
import { ImageIcon, SendHorizonal, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import {
  addMessage,
  fetchMessages,
  resetMessages,
} from "../features/messages/messagesSlice";
import toast from "react-hot-toast";

const ChatBox = () => {

  const { messages } = useSelector((state) => state.messages);
  const connections = useSelector((state) => state.connections.connections);

  const { userId } = useParams();
  const { getToken } = useAuth();
  const dispatch = useDispatch();

  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null);

  const messagesEndRef = useRef(null);

  const fetchUserMessages = async () => {
    try {
      const token = await getToken();
      dispatch(fetchMessages({ token, userId }));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendMessage = async () => {
    try {

      if (!text && !image) return;

      const token = await getToken();

      const formData = new FormData();
      formData.append("to_user_id", userId);
      formData.append("text", text);

      if (image) formData.append("image", image);

      const { data } = await api.post("/api/message/send", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {

        setText("");
        setImage(null);
        dispatch(addMessage(data.message));

      } else {

        throw new Error(data.message);

      }

    } catch (error) {

      toast.error(error.message);

    }
  };

  useEffect(() => {

    fetchUserMessages();

    return () => {
      dispatch(resetMessages());
    };

  }, [userId]);

  useEffect(() => {

    if (connections?.length > 0) {
      const foundUser = connections.find((c) => c._id === userId);
      if (foundUser) setUser(foundUser);
    }

  }, [connections, userId]);

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  }, [messages]);

  const profileImage =
    user?.profile_picture && user.profile_picture !== ""
      ? user.profile_picture
      : `https://ui-avatars.com/api/?name=${user?.full_name}&background=f1f5f9&color=475569`;

  return (

    <div className="flex flex-col h-screen bg-slate-50">

      {/* Header */}
      {user && (
        <div className="flex items-center gap-3 px-5 md:px-8 py-3 bg-white border-b border-slate-100 shadow-sm shrink-0">
          <div className="relative">
            <img
              src={profileImage}
              alt="profile"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white"></span>
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">{user.full_name}</p>
            <p className="text-xs text-slate-400">@{user.username}</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 md:px-8 py-6">
        <div className="space-y-3 max-w-2xl mx-auto">

          {[...messages]
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map((message, index) => {
              const isSent = message.to_user_id !== userId;
              return (
                <div
                  key={index}
                  className={`flex ${isSent ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-xs md:max-w-sm px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                      isSent
                        ? "bg-white text-slate-800 rounded-bl-sm border border-slate-100"
                        : "bg-slate-900 text-white rounded-br-sm"
                    }`}
                  >
                    {message.message_type === "image" && (
                      <img
                        src={message.media_url}
                        className="w-full rounded-xl mb-2"
                        alt=""
                      />
                    )}
                    {message.text && <p className="leading-relaxed">{message.text}</p>}
                  </div>
                </div>
              );
            })}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Image preview */}
      {image && (
        <div className="px-5 md:px-8 pb-2 max-w-2xl mx-auto w-full">
          <div className="relative inline-block">
            <img
              src={URL.createObjectURL(image)}
              alt=""
              className="h-16 rounded-xl border border-slate-200"
            />
            <button
              onClick={() => setImage(null)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 px-4 md:px-8 pb-5 pt-2">
        <div className="flex items-center gap-3 pl-5 pr-2 py-2 bg-white border border-slate-200 shadow-sm rounded-2xl max-w-2xl mx-auto">

          <input
            type="text"
            className="flex-1 outline-none text-sm text-slate-700 placeholder-slate-300"
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            onChange={(e) => setText(e.target.value)}
            value={text}
          />

          <label htmlFor="image" className="cursor-pointer shrink-0">
            <ImageIcon className="w-5 h-5 text-slate-300 hover:text-slate-500 transition" />
            <input
              type="file"
              id="image"
              accept="image/*"
              hidden
              onChange={(e) => setImage(e.target.files[0])}
            />
          </label>

          <button
            onClick={sendMessage}
            className="w-9 h-9 flex items-center justify-center bg-slate-900 hover:bg-slate-700 active:scale-95 text-white rounded-xl transition cursor-pointer shrink-0"
          >
            <SendHorizonal className="w-4 h-4" />
          </button>

        </div>
      </div>

    </div>
  );
};

export default ChatBox;
