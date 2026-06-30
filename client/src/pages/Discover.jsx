// ── Discover.jsx ──
import React, { useEffect, useState, useCallback } from "react";
import { Search } from "lucide-react";
import UserCard from "../components/UserCard";
import Loading from "../components/Loading";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { fetchUser } from "../features/user/userSlice";
import { useTheme } from "../context/ThemeContext";

const Discover = () => {
  const dispatch = useDispatch();
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();
  const { isDark } = useTheme();

  // ✅ real-time search — har letter pe call
  const handleSearch = useCallback(
    async (value) => {
      if (!value.trim()) {
        setUsers([]);
        return;
      }
      try {
        setLoading(true);
        const { data } = await api.post(
          "/api/user/discover",
          { input: value },
          { headers: { Authorization: `Bearer ${await getToken()}` } },
        );
        if (data.success) setUsers(data.users || []);
        else toast.error(data.message);
      } catch (error) {
        toast.error(error.message);
      }
      setLoading(false);
    },
    [getToken],
  );

  // ✅ debounce — 300ms wait karo, baar baar API call na ho
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(input);
    }, 300);
    return () => clearTimeout(timer);
  }, [input, handleSearch]);

  useEffect(() => {
    getToken().then((token) => {
      dispatch(fetchUser(token));
    });
  }, [dispatch, getToken]);

  return (
    <div className={`h-full overflow-y-auto no-scrollbar bg-transparent`}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1
            className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Discover People
          </h1>
          <p
            className={`text-sm mt-1 ${isDark ? "text-white/30" : "text-slate-400"}`}
          >
            Connect with amazing people and grow your network
          </p>
        </div>

        <div
          className={`rounded-2xl border p-4 mb-8 ${isDark ? "bg-zinc-900 border-white/5" : "bg-white border-slate-100 shadow-sm"}`}
        >
          <div className="relative">
            <Search
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-white/20" : "text-slate-300"}`}
            />
            <input
              type="text"
              placeholder="Search by name, username or location..."
              className={`w-full pl-11 pr-4 py-2.5 text-sm rounded-xl focus:outline-none transition ${
                isDark
                  ? "text-white placeholder-white/20 bg-zinc-800 border border-white/5 focus:border-sky-500/40"
                  : "text-slate-700 placeholder-slate-300 bg-slate-50 border border-slate-100 focus:border-slate-300"
              }`}
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
          </div>
        </div>

        {loading ? (
          <Loading height="40vh" />
        ) : (
          <>
            {users.length > 0 && (
              <p
                className={`text-xs mb-4 tracking-wide uppercase font-medium ${isDark ? "text-white/20" : "text-slate-400"}`}
              >
                {users.length} result{users.length !== 1 ? "s" : ""} found
              </p>
            )}
            <div className="flex flex-wrap gap-5">
              {users?.map((user) => (
                <UserCard user={user} key={user._id} />
              ))}
            </div>
            {users.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${isDark ? "bg-white/5" : "bg-slate-100"}`}
                >
                  <Search
                    className={`w-6 h-6 ${isDark ? "text-white/20" : "text-slate-300"}`}
                  />
                </div>
                <p
                  className={`text-sm font-medium ${isDark ? "text-white/30" : "text-slate-500"}`}
                >
                  Search for someone
                </p>
                <p
                  className={`text-xs mt-1 ${isDark ? "text-white/15" : "text-slate-400"}`}
                >
                  Type a name or username to find people
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Discover;
