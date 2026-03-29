import React, { useEffect, useRef, useState } from "react";
import { ImageIcon, SendHorizonal, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import api from "../api/axios";
import { addMessage, fetchMessages, resetMessages } from "../features/messages/messagesSlice";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

const POLL_INTERVAL = 3000; // 3 seconds

const ChatBox = () => {
  const { messages } = useSelector((state) => state.messages);
  const connections = useSelector((state) => state.connections.connections);
  const { userId } = useParams();
  const { getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const dispatch = useDispatch();
  const { isDark } = useTheme();

  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const lastMessageIdRef = useRef(null);

  // ── fetch all messages on load ──
  const fetchUserMessages = async () => {
    try {
      const token = await getToken();
      dispatch(fetchMessages({ token, userId }));
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ── send message ──
  const sendMessage = async () => {
    try {
      if (!text && !image) return;

      const formData = new FormData();
      formData.append("to_user_id", userId);
      formData.append("text", text);
      if (image) formData.append("image", image);

      const { data } = await api.post("/api/message/send", formData, {
        headers: { Authorization: `Bearer ${await getToken()}` },
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

  // ── SSE: listen for incoming messages ──
  useEffect(() => {
    if (!clerkUser) return;

    const es = new EventSource(
      `${import.meta.env.VITE_BASEURL}/api/message/${clerkUser.id}`
    );

    es.onmessage = (event) => {
      let message;
      try { message = JSON.parse(event.data); } catch { return; }

      const senderId = message?.from_user_id?._id || message?.from_user_id;
      if (senderId === userId) {
        dispatch(addMessage(message));
      }
    };

    es.onerror = () => { es.close(); };

    return () => { es.close(); };
  }, [clerkUser, userId, dispatch]);

  // ── Polling: re-fetch messages every 3s as fallback ──
  useEffect(() => {
    if (!userId) return;

    const poll = async () => {
      try {
        const token = await getToken();
        const { data } = await api.post(
          "/api/message/get",
          { to_user_id: userId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.success && data.messages?.length > 0) {
          const latest = data.messages[data.messages.length - 1];

          // sirf naye messages add karo — duplicate avoid karo
          if (latest._id !== lastMessageIdRef.current) {
            lastMessageIdRef.current = latest._id;
            dispatch(fetchMessages({ token, userId }));
          }
        }
      } catch { /* silent */ }
    };

    pollRef.current = setInterval(poll, POLL_INTERVAL);

    return () => clearInterval(pollRef.current);
  }, [userId, getToken, dispatch]);

  // ── initial load ──
  useEffect(() => {
    fetchUserMessages();
    return () => {
      dispatch(resetMessages());
      clearInterval(pollRef.current);
    };
  }, [userId]);

  // ── find chat user from connections ──
  useEffect(() => {
    if (connections?.length > 0) {
      const foundUser = connections.find((c) => c._id === userId);
      if (foundUser) setUser(foundUser);
    }
  }, [connections, userId]);

  // ── auto scroll to bottom ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const profileImage =
    user?.profile_picture && user.profile_picture !== ""
      ? user.profile_picture
      : `https://ui-avatars.com/api/?name=${user?.full_name}`;

  return (
    <div className={`flex flex-col h-screen ${isDark ? "bg-black" : "bg-slate-50"}`}>

      {/* Header */}
      {user && (
        <div className={`flex items-center gap-3 px-5 md:px-8 py-3 border-b shrink-0 ${
          isDark ? "bg-zinc-950 border-white/5" : "bg-white border-slate-100 shadow-sm"
        }`}>
          <div className="relative">
            <img src={profileImage} alt="profile"
              className="w-9 h-9 rounded-full object-cover" />
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 ${
              isDark ? "border-zinc-950" : "border-white"
            }`}></span>
          </div>
          <div>
            <p className={`font-semibold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
              {user.full_name}
            </p>
            <p className={`text-xs ${isDark ? "text-white/30" : "text-slate-400"}`}>
              @{user.username}
            </p>
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
                <div key={message._id || index}
                  className={`flex ${isSent ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-xs md:max-w-sm px-4 py-2.5 rounded-2xl text-sm ${
                    isSent
                      ? isDark
                        ? "bg-zinc-900 text-white/80 rounded-bl-sm border border-white/5"
                        : "bg-white text-slate-800 rounded-bl-sm border border-slate-100 shadow-sm"
                      : isDark
                        ? "bg-sky-500 text-black rounded-br-sm"
                        : "bg-slate-900 text-white rounded-br-sm"
                  }`}>
                    {message.message_type === "image" && (
                      <img src={message.media_url} className="w-full rounded-xl mb-2" alt="" />
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
            <img src={URL.createObjectURL(image)} alt="" className="h-16 rounded-xl" />
            <button onClick={() => setImage(null)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 px-4 md:px-8 pb-5 pt-2">
        <div className={`flex items-center gap-3 pl-5 pr-2 py-2 rounded-2xl max-w-2xl mx-auto border ${
          isDark ? "bg-zinc-900 border-white/10" : "bg-white border-slate-200 shadow-sm"
        }`}>
          <input
            type="text"
            className={`flex-1 outline-none text-sm bg-transparent ${
              isDark ? "text-white placeholder-white/20" : "text-slate-700 placeholder-slate-300"
            }`}
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            onChange={(e) => setText(e.target.value)}
            value={text}
          />

          <label htmlFor="image" className="cursor-pointer shrink-0">
            <ImageIcon className={`w-5 h-5 transition ${
              isDark ? "text-white/20 hover:text-white/50" : "text-slate-300 hover:text-slate-500"
            }`} />
            <input type="file" id="image" accept="image/*" hidden
              onChange={(e) => setImage(e.target.files[0])} />
          </label>

          <button onClick={sendMessage}
            className={`w-9 h-9 flex items-center justify-center rounded-xl active:scale-95 transition cursor-pointer shrink-0 ${
              isDark ? "bg-sky-500 hover:bg-sky-400 text-black" : "bg-slate-900 hover:bg-slate-700 text-white"
            }`}>
            <SendHorizonal className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default ChatBox;
