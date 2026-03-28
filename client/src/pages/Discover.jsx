import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import UserCard from "../components/UserCard";
import Loading from "../components/Loading";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { fetchUser } from "../features/user/userSlice";

const Discover = () => {

  const dispatch = useDispatch();

  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const { getToken } = useAuth();

  const handleSearch = async (e) => {

    if (e.key === "Enter") {

      try {

        setUsers([]);
        setLoading(true);

        const { data } = await api.post(
          "/api/user/discover",
          { input },
          {
            headers: { Authorization: `Bearer ${await getToken()}` },
          }
        );

        if (data.success) {
          setUsers(data.users || []);
        } else {
          toast.error(data.message);
        }

        setInput("");

      } catch (error) {

        toast.error(error.message);

      }

      setLoading(false);
    }
  };

  useEffect(() => {

    getToken().then((token) => {
      dispatch(fetchUser(token));
    });

  }, [dispatch, getToken]);

  return (

    <div className="min-h-screen bg-slate-50 overflow-y-auto no-scrollbar">

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Discover People</h1>
          <p className="text-sm text-slate-400 mt-1">Connect with amazing people and grow your network</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, username, bio or location... (press Enter)"
              className="w-full pl-11 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-300 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-slate-300 focus:bg-white transition"
              onChange={(e) => setInput(e.target.value)}
              value={input}
              onKeyDown={handleSearch}
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <Loading height="40vh" />
        ) : (
          <>
            {users.length > 0 && (
              <p className="text-xs text-slate-400 mb-4 tracking-wide uppercase font-medium">
                {users.length} result{users.length !== 1 ? "s" : ""} found
              </p>
            )}
            <div className="flex flex-wrap gap-5">
              {users?.map((user) => (
                <UserCard user={user} key={user._id} />
              ))}
            </div>

            {users.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-500 text-sm font-medium">Search for someone</p>
                <p className="text-slate-400 text-xs mt-1">Type a name or username and press Enter</p>
              </div>
            )}
          </>
        )}

      </div>

    </div>
  );
};

export default Discover;
