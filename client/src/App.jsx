import React, { useRef, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Feed from "./pages/Feed";
import Login from "./pages/Login";
import Messages from "./pages/Messages";
import ChatBox from "./pages/ChatBox";
import Connections from "./pages/Connections";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import Reels from "./pages/Reels";
import CreateReel from "./pages/CreateReel";
import { useUser, useAuth } from "@clerk/clerk-react";
import Layout from "./pages/Layout";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { fetchUser } from "./features/user/userSlice";
import { fetchConnections } from "./features/connections/connectionSlice";
import { addMessage } from "./features/messages/messagesSlice";
import Notification from "./components/Notification";

const POLL_INTERVAL = 5000; // 5 seconds

const App = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { pathname } = useLocation();
  const pathnameRef = useRef(pathname);
  const dispatch = useDispatch();
  const pollRef = useRef(null);

  // ── initial data fetch ──
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const token = await getToken();
        dispatch(fetchUser(token));
        dispatch(fetchConnections(token));
      }
    };
    fetchData();
  }, [user, getToken, dispatch]);

  // ── keep pathnameRef updated ──
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // ── SSE: real-time messages ──
  useEffect(() => {
    if (!user) return;

    const eventSource = new EventSource(
      import.meta.env.VITE_BASEURL + "/api/message/" + user.id,
    );

    eventSource.onmessage = (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }
      if (!message || !message.from_user_id) return;

      const currentPath = pathnameRef.current;
      const senderId = message.from_user_id?._id || message.from_user_id;

      if (currentPath === "/messages/" + senderId) {
        // user is already in this chat — add message directly
        dispatch(addMessage(message));
      } else {
        // user is on another page — show notification toast
        toast.custom((t) => <Notification t={t} message={message} />, {
          position: "bottom-right",
          duration: 5000,
        });
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [user, dispatch]);

  // ── Polling: connections + user data har 5 sec refresh ──
  useEffect(() => {
    if (!user) return;

    const poll = async () => {
      try {
        const token = await getToken();
        dispatch(fetchConnections(token));
        dispatch(fetchUser(token));
      } catch {
        /* silent fail */
      }
    };

    pollRef.current = setInterval(poll, POLL_INTERVAL);

    return () => clearInterval(pollRef.current);
  }, [user, getToken, dispatch]);

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            borderRadius: "12px",
            background: "#18181b",
            color: "#f4f4f5",
            fontSize: "13px",
            border: "1px solid rgba(255,255,255,0.08)",
          },
        }}
      />

      <Routes>
        <Route path="/" element={!user ? <Login /> : <Layout />}>
          <Route index element={<Feed />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:userId" element={<ChatBox />} />
          <Route path="connections" element={<Connections />} />
          <Route path="discover" element={<Discover />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:profileId" element={<Profile />} />
          <Route path="create-post" element={<CreatePost />} />
          <Route path="reels" element={<Reels />} />
          <Route path="create-reel" element={<CreateReel />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
