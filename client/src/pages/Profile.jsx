import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import PostCard from "../components/PostCard";
import UserProfileInfo from "../components/UserProfileInfo";
import moment from "moment";
import ProfileModal from "../components/ProfileModal";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const Profile = () => {

  const currentUser = useSelector((state) => state.user.value);

  const { getToken } = useAuth();

  const { profileId } = useParams();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [showEdit, setShowEdit] = useState(false);

  const fetchUser = async (profileId) => {

    try {

      const token = await getToken();

      const { data } = await api.post(
        `/api/user/profiles`,
        { profileId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {

        setUser(data.profile);
        setPosts(data.posts);

      } else {

        toast.error(data.message);

      }

    } catch (error) {

      toast.error(error.message);

    }

  };

  // post delete hone par list se remove karo
  const handlePostDelete = (postId) => {
    setPosts((prev) => prev.filter((post) => post._id !== postId));
  };

  useEffect(() => {

    if (!currentUser) return;

    if (profileId) {

      fetchUser(profileId);

    } else {

      fetchUser(currentUser._id);

    }

  }, [profileId, currentUser]);

  const tabs = ["posts", "media", "likes"];

  return user ? (

    <div className="relative h-full overflow-y-scroll no-scrollbar bg-slate-50">

      <div className="max-w-2xl mx-auto pb-10 px-4 sm:px-6">

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-4">

          {/* Cover Photo */}
          <div className="h-36 md:h-48 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100">
            {user.cover_photo && (
              <img
                src={user.cover_photo}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* User Info */}
          <UserProfileInfo
            user={user}
            posts={posts}
            profileId={profileId}
            setShowEdit={setShowEdit}
          />

        </div>

        {/* Tabs */}
        <div className="mt-6">

          <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
            {tabs.map((tab) => (
              <button
                onClick={() => setActiveTab(tab)}
                key={tab}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer capitalize ${
                  activeTab === tab
                    ? "bg-slate-900 text-white shadow"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Posts Tab */}
          {activeTab === "posts" && (
            <div className="mt-5 space-y-4">
              {posts?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-slate-400 text-sm">No posts yet</p>
                </div>
              ) : (
                posts?.map((post) => (
                  <PostCard key={post._id} post={post} onDelete={handlePostDelete} />
                ))
              )}
            </div>
          )}

          {/* Media Tab */}
          {activeTab === "media" && (
            <div className="mt-5 grid grid-cols-3 gap-1.5 rounded-2xl overflow-hidden">
              {posts
                ?.filter((post) => post.image_urls?.length > 0)
                .flatMap((post) =>
                  post.image_urls.map((image, index) => (
                    <Link
                      target="_blank"
                      to={image}
                      key={`${post._id}-${index}`}
                      className="relative group aspect-square overflow-hidden rounded-xl"
                    >
                      <img
                        src={image}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        alt=""
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition duration-300 flex items-end">
                        <p className="w-full text-[10px] px-2 pb-2 text-white opacity-0 group-hover:opacity-100 transition duration-300">
                          {moment(post.createdAt).fromNow()}
                        </p>
                      </div>
                    </Link>
                  ))
                )}

              {posts?.filter((post) => post.image_urls?.length > 0).length === 0 && (
                <div className="col-span-3 py-16 text-center">
                  <p className="text-slate-400 text-sm">No media yet</p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Edit Profile Modal */}
      {showEdit && <ProfileModal setShowEdit={setShowEdit} />}

    </div>

  ) : (

    <Loading />

  );

};

export default Profile;
