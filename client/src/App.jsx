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

const App = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { pathname } = useLocation();
  const pathnameRef = useRef(pathname);
  const dispatch = useDispatch();

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

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (user) {

      const eventSource = new EventSource(
        import.meta.env.VITE_BASEURL + "/api/message/" + user.id
      );

      eventSource.onmessage = (event) => {

        let message;

        try {
          message = JSON.parse(event.data);
        } catch (error) {
          return;
        }

        if (!message || !message.from_user_id) return;

        if (pathnameRef.current === "/messages/" + message.from_user_id._id) {
          dispatch(addMessage(message));
        } else {
          toast(message.text || "New message received", {
            position: "bottom-right",
          });
        }
      };

      return () => {
        eventSource.close();
      };
    }
  }, [user, dispatch]);

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            borderRadius: "12px",
            background: "#0f172a",
            color: "#f8fafc",
            fontSize: "13px",
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
