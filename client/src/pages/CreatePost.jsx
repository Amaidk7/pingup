// ── CreatePost.jsx ──
import React, { useState } from "react";
import { ImagePlus, X, Sparkles, Loader2, Image, Hash } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const CreatePost = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Topic-based caption states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [topic, setTopic] = useState("");
  const [showTopicInput, setShowTopicInput] = useState(false);

  // Image caption states
  const [imgCaptionLoading, setImgCaptionLoading] = useState(false);
  const [imgCaptionSuggestions, setImgCaptionSuggestions] = useState([]);
  const [showImgSuggestions, setShowImgSuggestions] = useState(false);

  // ✅ Hashtag states
  const [hashtagLoading, setHashtagLoading] = useState(false);
  const [hashtags, setHashtags] = useState([]);
  const [showHashtags, setShowHashtags] = useState(false);

  const user = useSelector((state) => state.user.value);
  const { getToken } = useAuth();
  const { isDark } = useTheme();

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
    });
  };

  // Image dekh ke AI caption
  const generateImageCaption = async () => {
    if (!images.length) { toast.error("Pehle koi photo upload karo!"); return; }
    setImgCaptionLoading(true);
    setShowImgSuggestions(true);
    try {
      const base64 = await fileToBase64(images[0]);
      const mimeType = images[0].type || "image/jpeg";
      const prompt = `Look at this image carefully and generate 4 engaging social media captions for it.
      Rules:
      - Each caption should be unique in tone (professional, casual, funny, inspirational)
      - Keep each caption under 150 characters
      - Add 2-3 relevant emojis based on what you see in the image
      - Do NOT number them
      - Separate each caption with "|||"
      - Return ONLY the captions, nothing else`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64 } }] }],
          }),
        }
      );
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      let captions = [];
      if (text.includes("|||")) {
        captions = text.split("|||").map((c) => c.trim()).filter(Boolean);
      } else {
        captions = text.split("\n").map((c) => c.replace(/^\d+[\.)]\s*/, "").trim()).filter((c) => c.length > 5);
      }
      setImgCaptionSuggestions(captions.slice(0, 4));
    } catch (error) { toast.error("Image caption generate nahi hua. Dobara try karo!"); }
    setImgCaptionLoading(false);
  };

  // Topic-based caption
  const generateCaptions = async () => {
    if (!topic.trim() && !content.trim()) { setShowTopicInput(true); return; }
    setAiLoading(true);
    setShowSuggestions(true);
    try {
      const prompt = `Generate 4 engaging social media post captions for the following topic: "${topic || content}".
      Rules:
      - Each caption should be unique in tone (professional, casual, funny, inspirational)
      - Keep each caption under 150 characters
      - Add 2-3 relevant emojis in each
      - Do NOT number them
      - Separate each caption with "|||"
      - Return ONLY the captions, nothing else`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const captions = text.split("|||").map((c) => c.trim()).filter(Boolean);
      setAiSuggestions(captions);
    } catch (error) { toast.error("AI caption generate nahi hua. Dobara try karo!"); }
    setAiLoading(false);
  };

  // ✅ Hashtag Generator
  const generateHashtags = async () => {
    if (!content.trim() && !topic.trim() && !images.length) {
      return toast.error("Pehle caption likho ya image upload karo!");
    }
    setHashtagLoading(true);
    setShowHashtags(true);
    try {
      let prompt;
      let parts;

      if (images.length > 0) {
        // Image hai — vision se hashtags
        const base64 = await fileToBase64(images[0]);
        const mimeType = images[0].type || "image/jpeg";
        prompt = `Look at this image and generate 15 relevant trending social media hashtags.
        Rules:
        - Mix of popular and niche hashtags
        - Each hashtag must start with #
        - Separate with single space
        - Include trending ones like #viral #trending #fyp where relevant
        - Return ONLY hashtags, nothing else`;
        parts = [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64 } }];
      } else {
        // Text se hashtags
        prompt = `Generate 15 relevant trending social media hashtags for this topic: "${content || topic}".
        Rules:
        - Mix of popular and niche hashtags
        - Each hashtag must start with #
        - Separate with single space
        - Include trending ones like #viral #trending #fyp where relevant
        - Return ONLY hashtags, nothing else`;
        parts = [{ text: prompt }];
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts }] }),
        }
      );
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const tags = text.trim().split(/\s+/).filter((t) => t.startsWith("#"));
      setHashtags(tags.slice(0, 15));
    } catch (error) { toast.error("Hashtags generate nahi hue. Dobara try karo!"); }
    setHashtagLoading(false);
  };

  // ✅ Hashtag ko caption mein append karo
  const applyHashtag = (tag) => {
    setContent((prev) => prev.trim() + " " + tag);
    toast.success(`${tag} add ho gaya!`);
  };

  // ✅ Saare hashtags ek saath append
  const applyAllHashtags = () => {
    setContent((prev) => prev.trim() + "\n\n" + hashtags.join(" "));
    setShowHashtags(false);
    setHashtags([]);
    toast.success("Saare hashtags add ho gaye!");
  };

  const handleSubmit = async () => {
    if (!images.length && !content) return toast.error("Please add at least one image or text");
    setLoading(true);
    const postType = images.length && content ? "text_with_image" : images.length ? "image" : "text";
    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("post_type", postType);
      images.forEach((image) => { formData.append("images", image); });
      const { data } = await api.post("/api/post/add", formData, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) navigate("/");
      else throw new Error(data.message);
    } catch (error) { toast.error(error.message); }
    setLoading(false);
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar bg-transparent">
      <div className="max-w-xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Create Post</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>Share your thoughts with the world</p>
        </div>

        <div className={`rounded-2xl border overflow-hidden ${isDark ? "bg-zinc-900 border-white/5" : "bg-white border-slate-100 shadow-sm"}`}>

          {/* User info */}
          <div className={`flex items-center gap-3 px-5 pt-5 pb-4 border-b ${isDark ? "border-white/5" : "border-slate-50"}`}>
            <img src={user?.profile_picture} alt="" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <h2 className={`font-semibold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{user?.full_name}</h2>
              <p className={`text-xs ${isDark ? "text-white/30" : "text-slate-400"}`}>@{user?.username}</p>
            </div>
          </div>

          {/* Textarea */}
          <div className="px-5 py-4">
            <textarea
              className={`w-full resize-none text-sm outline-none min-h-[120px] leading-relaxed bg-transparent ${
                isDark ? "text-white/80 placeholder-white/20" : "text-slate-700 placeholder-slate-300"
              }`}
              placeholder="What's on your mind?"
              onChange={(e) => setContent(e.target.value)} value={content} />
          </div>

          {/* AI Caption Generator (topic based) */}
          <div className={`mx-5 mb-4 rounded-xl border overflow-hidden ${isDark ? "border-white/5 bg-zinc-800/50" : "border-slate-100 bg-slate-50"}`}>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className={`w-4 h-4 ${isDark ? "text-sky-400" : "text-sky-500"}`} />
                <span className={`text-xs font-semibold ${isDark ? "text-white/60" : "text-slate-600"}`}>AI Caption Generator</span>
              </div>
              <button
                onClick={() => { if (!topic.trim() && !content.trim()) setShowTopicInput(true); else generateCaptions(); }}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition active:scale-95 cursor-pointer ${
                  isDark ? "bg-sky-500 text-black hover:bg-sky-400" : "bg-slate-900 text-white hover:bg-slate-700"
                }`}>
                {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {aiLoading ? "Generating..." : "Generate"}
              </button>
            </div>
            {showTopicInput && (
              <div className="px-4 pb-3 flex gap-2">
                <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                  placeholder="Post kis baare mein hai? (e.g. sunset, food, travel)"
                  className={`flex-1 text-xs px-3 py-2 rounded-lg outline-none border ${
                    isDark ? "bg-zinc-900 border-white/10 text-white placeholder-white/20" : "bg-white border-slate-200 text-slate-700 placeholder-slate-300"
                  }`} />
                <button onClick={generateCaptions} disabled={!topic.trim()}
                  className={`text-xs font-semibold px-3 py-2 rounded-lg transition cursor-pointer disabled:opacity-40 ${
                    isDark ? "bg-sky-500 text-black hover:bg-sky-400" : "bg-slate-900 text-white hover:bg-slate-700"
                  }`}>Go</button>
              </div>
            )}
            {showSuggestions && (
              <div className={`border-t ${isDark ? "border-white/5" : "border-slate-100"}`}>
                {aiLoading ? (
                  <div className="flex items-center justify-center gap-2 py-6">
                    <Loader2 className={`w-4 h-4 animate-spin ${isDark ? "text-white/30" : "text-slate-300"}`} />
                    <span className={`text-xs ${isDark ? "text-white/30" : "text-slate-400"}`}>AI likh raha hai...</span>
                  </div>
                ) : (
                  <div className="p-2 space-y-1.5">
                    <p className={`text-[10px] px-2 pb-1 ${isDark ? "text-white/20" : "text-slate-400"}`}>Click karo to use ✨</p>
                    {aiSuggestions.map((caption, i) => (
                      <button key={i}
                        onClick={() => { setContent(caption); setShowSuggestions(false); toast.success("Caption apply ho gaya!"); }}
                        className={`w-full text-left text-xs px-3 py-2.5 rounded-lg transition cursor-pointer ${
                          isDark ? "text-white/70 hover:bg-white/5 hover:text-white" : "text-slate-600 hover:bg-white hover:text-slate-900"
                        }`}>{caption}</button>
                    ))}
                    <button onClick={generateCaptions}
                      className={`w-full text-center text-[10px] py-2 rounded-lg transition cursor-pointer ${
                        isDark ? "text-sky-400 hover:bg-white/5" : "text-sky-500 hover:bg-white"
                      }`}>↻ Regenerate</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Images preview */}
          {images.length > 0 && (
            <div className="px-5 pb-2 flex flex-wrap gap-2">
              {images.map((image, i) => (
                <div key={i} className="relative group">
                  <img src={URL.createObjectURL(image)} className="h-24 w-24 object-cover rounded-xl" alt="" />
                  <button onClick={() => { setImages(images.filter((_, index) => index !== i)); setShowImgSuggestions(false); setImgCaptionSuggestions([]); }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* AI Image Caption */}
          {images.length > 0 && (
            <div className={`mx-5 mb-4 rounded-xl border overflow-hidden ${isDark ? "border-violet-500/10 bg-violet-500/5" : "border-violet-100 bg-violet-50/50"}`}>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <Image className={`w-4 h-4 ${isDark ? "text-violet-400" : "text-violet-500"}`} />
                  <span className={`text-xs font-semibold ${isDark ? "text-white/60" : "text-slate-600"}`}>AI Image Caption</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isDark ? "bg-violet-500/10 text-violet-400" : "bg-violet-100 text-violet-500"}`}>📸 Photo dekh ke likhega</span>
                </div>
                <button onClick={generateImageCaption}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition active:scale-95 cursor-pointer ${
                    isDark ? "bg-violet-500 text-white hover:bg-violet-400" : "bg-violet-600 text-white hover:bg-violet-500"
                  }`}>
                  {imgCaptionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  {imgCaptionLoading ? "Dekh raha hai..." : "Generate"}
                </button>
              </div>
              {showImgSuggestions && (
                <div className={`border-t ${isDark ? "border-violet-500/10" : "border-violet-100"}`}>
                  {imgCaptionLoading ? (
                    <div className="flex items-center justify-center gap-2 py-6">
                      <Loader2 className={`w-4 h-4 animate-spin ${isDark ? "text-violet-400/50" : "text-violet-300"}`} />
                      <span className={`text-xs ${isDark ? "text-white/30" : "text-slate-400"}`}>Photo dekh ke likh raha hai...</span>
                    </div>
                  ) : (
                    <div className="p-2 space-y-1.5">
                      <p className={`text-[10px] px-2 pb-1 ${isDark ? "text-white/20" : "text-slate-400"}`}>Click karo to use ✨</p>
                      {imgCaptionSuggestions.map((caption, i) => (
                        <button key={i}
                          onClick={() => { setContent(caption); setShowImgSuggestions(false); toast.success("Caption apply ho gaya!"); }}
                          className={`w-full text-left text-xs px-3 py-2.5 rounded-lg transition cursor-pointer ${
                            isDark ? "text-white/70 hover:bg-violet-500/10 hover:text-white" : "text-slate-600 hover:bg-violet-50 hover:text-slate-900"
                          }`}>{caption}</button>
                      ))}
                      <button onClick={generateImageCaption}
                        className={`w-full text-center text-[10px] py-2 rounded-lg transition cursor-pointer ${
                          isDark ? "text-violet-400 hover:bg-violet-500/10" : "text-violet-500 hover:bg-violet-50"
                        }`}>↻ Regenerate</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ✅ Hashtag Generator — green color */}
          <div className={`mx-5 mb-4 rounded-xl border overflow-hidden ${isDark ? "border-emerald-500/10 bg-emerald-500/5" : "border-emerald-100 bg-emerald-50/50"}`}>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <Hash className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-500"}`} />
                <span className={`text-xs font-semibold ${isDark ? "text-white/60" : "text-slate-600"}`}>AI Hashtag Generator</span>
              </div>
              <button onClick={generateHashtags}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition active:scale-95 cursor-pointer ${
                  isDark ? "bg-emerald-500 text-black hover:bg-emerald-400" : "bg-emerald-600 text-white hover:bg-emerald-500"
                }`}>
                {hashtagLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Hash className="w-3 h-3" />}
                {hashtagLoading ? "Generating..." : "Generate"}
              </button>
            </div>

            {showHashtags && (
              <div className={`border-t ${isDark ? "border-emerald-500/10" : "border-emerald-100"}`}>
                {hashtagLoading ? (
                  <div className="flex items-center justify-center gap-2 py-6">
                    <Loader2 className={`w-4 h-4 animate-spin ${isDark ? "text-emerald-400/50" : "text-emerald-300"}`} />
                    <span className={`text-xs ${isDark ? "text-white/30" : "text-slate-400"}`}>Hashtags dhundh raha hai...</span>
                  </div>
                ) : (
                  <div className="p-3 space-y-3">
                    {/* Individual hashtag chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {hashtags.map((tag, i) => (
                        <button key={i} onClick={() => applyHashtag(tag)}
                          className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition cursor-pointer ${
                            isDark
                              ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          }`}>
                          {tag}
                        </button>
                      ))}
                    </div>
                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button onClick={applyAllHashtags}
                        className={`flex-1 text-xs font-semibold py-2 rounded-lg transition cursor-pointer ${
                          isDark ? "bg-emerald-500 text-black hover:bg-emerald-400" : "bg-emerald-600 text-white hover:bg-emerald-500"
                        }`}>
                        + Add All
                      </button>
                      <button onClick={generateHashtags}
                        className={`text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer border ${
                          isDark ? "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10" : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        }`}>
                        ↻ Regenerate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div className={`flex items-center justify-between px-5 py-3 border-t ${isDark ? "border-white/5 bg-zinc-950/50" : "border-slate-50 bg-slate-50/50"}`}>
            <label htmlFor="images"
              className={`flex items-center gap-2 text-xs font-medium transition cursor-pointer py-2 px-3 rounded-xl ${
                isDark ? "text-white/30 hover:text-white/60 hover:bg-white/5" : "text-slate-400 hover:text-slate-700 hover:bg-white"
              }`}>
              <ImagePlus className="w-4 h-4" /> Add Photo
            </label>
            <input type="file" id="images" accept="image/*" hidden multiple
              onChange={(e) => setImages([...images, ...Array.from(e.target.files)])} />
            <button disabled={loading}
              onClick={() => toast.promise(handleSubmit(), { loading: "Uploading...", success: <p>Post Added</p>, error: <p>Post Not Added</p> })}
              className={`text-sm font-semibold px-6 py-2 rounded-xl active:scale-95 transition cursor-pointer disabled:opacity-40 ${
                isDark ? "bg-sky-500 text-black hover:bg-sky-400" : "bg-slate-900 text-white hover:bg-slate-700"
              }`}>Publish</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
