import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import PageWrapper from "../../components/PageWrapper";
import Card from "../../components/ui/Card";
import ShareButton from "./ShareButton";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Heart, Download, RotateCcw } from "lucide-react";
import html2canvas from "html2canvas";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function Result() {
  const [slider, setSlider] = useState(50);
  const [uploaded, setUploaded] = useState(null);
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const [upcycleName, setUpcycleName] = useState("");
  const [description, setDescription] = useState("");
  const [garment, setGarment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const comparisonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const img = sessionStorage.getItem("uploadedImage");
    if (!img) { navigate("/upload"); return; }
    setUploaded(img);
    callBackend(img);
    checkFavorite(img);
  }, [navigate]);

  const callBackend = async (imgBase64) => {
    try {
      setLoading(true);
      setError(null);
      const res      = await fetch(imgBase64);
      const blob     = await res.blob();
      const formData = new FormData();
      formData.append("file", blob, "garment.jpg");
      const response = await fetch(`${API_URL}/api/upcycle`, {
        method: "POST",
        body:   formData,
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      setGeneratedUrl(`${API_URL}${data.generated_url}`);
      setUpcycleName(data.upcycle_name);
      setDescription(data.description);
      setGarment(data.detected_garment);
    } catch (err) {
      console.error("Upcycle error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async (img) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && img) {
        const { data } = await supabase.from("favorites").select("id")
          .eq("user_id", user.id).eq("original_image", img).limit(1);
        if (data && data.length > 0) setIsFavorite(true);
      }
    } catch (e) { console.error(e); }
  };

  const saveDesign = async () => {
    if (comparisonRef.current) {
      const canvas = await html2canvas(comparisonRef.current, { useCORS: true, scale: 2 });
      const link = document.createElement("a");
      link.download = "upcycled-design.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  const toggleFavorite = async () => {
    try {
      if (!uploaded) return;
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) { setShowAuthModal(true); return; }
      const user = sessionData.session.user;
      setSavingFavorite(true);
      if (isFavorite) {
        await supabase.from("favorites").delete()
          .eq("user_id", user.id).eq("original_image", uploaded);
        setIsFavorite(false);
      } else {
        await supabase.from("favorites").insert([{
          user_id: user.id, original_image: uploaded,
          title: upcycleName || "Upcycled Design",
        }]);
        setIsFavorite(true);
      }
    } catch (e) { console.error(e); }
    finally { setSavingFavorite(false); }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6 bg-gradient-to-br from-cream-100 via-amber-50 to-orange-50">
        <Card className="p-6 md:p-10 glass max-w-2xl w-full flex flex-col items-center shadow-lg border border-white/40">

          {/* Header */}
          <div className="text-center mb-6 w-full">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-2">Your Upcycled Design</h1>
            {garment && (
              <p className="text-sm text-gray-500 mb-1">
                Detected: <span className="font-semibold capitalize">{garment}</span>
                {upcycleName && <> → <span className="font-semibold text-slate-700">{upcycleName}</span></>}
              </p>
            )}
            <p className="text-gray-600 text-base">
              {loading ? "AI is upcycling your garment…"
                : error ? "Something went wrong"
                : "Drag the slider to compare original and AI redesign"}
            </p>
          </div>

          {/* COMPARISON BOX */}
          <div
            ref={comparisonRef}
            className="relative w-full rounded-lg overflow-hidden border border-gray-200 shadow-md bg-white mb-8"
            style={{ height: "500px" }}
          >
            {/* RIGHT: AI generated — full box, behind everything */}
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              {loading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                  <p className="text-gray-500 text-sm">Upcycling in progress…</p>
                  <p className="text-gray-400 text-xs">This takes ~30–60 seconds</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center gap-2 p-6">
                  <p className="text-red-600 font-semibold">Error</p>
                  <p className="text-red-500 text-sm text-center">{error}</p>
                  <button
                    onClick={() => uploaded && callBackend(uploaded)}
                    className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-900"
                  >Retry</button>
                </div>
              ) : generatedUrl ? (
                <img
                  src={generatedUrl}
                  alt="AI Redesign"
                  crossOrigin="anonymous"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : null}
            </div>

            {/* AI label */}
            {!loading && !error && (
              <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded">
                AI REDESIGN
              </div>
            )}

            {/* LEFT: Original — clipped to slider% width, image kept at full box size */}
            {uploaded && (
              <div
                className="absolute inset-0 z-10 overflow-hidden"
                style={{ width: `${slider}%` }}
              >
                {/* 
                  The inner container must be the FULL box width (not slider%).
                  We achieve this by setting width to 100%/slider * 100 so the 
                  image always renders at full size and the parent clips it.
                */}
                <div
                  className="absolute inset-y-0 left-0 flex items-center justify-center bg-white"
                  style={{ width: `${(100 / slider) * 100}%` }}
                >
                  <img
                    src={uploaded}
                    alt="Original"
                    style={{ width: "100%", height: "500px", objectFit: "contain" }}
                  />
                </div>
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded">
                  ORIGINAL
                </div>
              </div>
            )}

            {/* Divider line + handle */}
            {!loading && !error && generatedUrl && (
              <>
                <div
                  className="absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow"
                  style={{ left: `${slider}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full border-2 border-gray-400 shadow-lg flex items-center justify-center cursor-ew-resize select-none">
                    <span className="text-gray-600 font-bold text-sm">↔</span>
                  </div>
                </div>
                <input
                  type="range" min="1" max="99" value={slider}
                  onChange={(e) => setSlider(Number(e.target.value))}
                  className="absolute inset-0 z-30 opacity-0 cursor-ew-resize w-full h-full"
                />
              </>
            )}
          </div>

          {/* Description */}
          {description && !loading && (
            <p className="text-sm text-gray-500 mb-6 text-center italic">{description}</p>
          )}

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
            <motion.button
              onClick={() => navigate("/upload")}
              whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              <RotateCcw size={18} />
              <span className="hidden sm:inline">Try Another</span>
              <span className="sm:hidden">Another</span>
            </motion.button>

            <motion.button
              onClick={saveDesign}
              disabled={loading || !!error}
              whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-slate-800 text-white font-semibold text-sm hover:bg-slate-900 transition-colors shadow-sm disabled:opacity-50"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Save</span>
            </motion.button>

            <motion.button
              onClick={toggleFavorite}
              disabled={savingFavorite}
              whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-sm transition-colors ${
                isFavorite
                  ? "bg-rose-600 text-white hover:bg-rose-700"
                  : "border border-rose-400 text-rose-600 hover:bg-rose-50"
              } disabled:opacity-50`}
            >
              {savingFavorite
                ? <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <>
                    <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
                    <span className="hidden sm:inline">{isFavorite ? "Saved" : "Favorite"}</span>
                  </>
              }
            </motion.button>

            <ShareButton
              designImage={generatedUrl || uploaded}
              title="🌿 My Upcycled Design"
              description="I just transformed an old garment with Second Stitch AI! ♻️"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
            />
          </div>
        </Card>

        {/* Auth Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-2xl p-8 max-w-sm w-full text-center"
            >
              <Heart className="w-12 h-12 text-rose-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Save Your Favorites</h2>
              <p className="text-gray-600 mb-6">Sign in to save and track your favorite upcycled designs</p>
              <div className="flex gap-3 mb-4">
                <button onClick={() => navigate("/register")}
                  className="flex-1 py-3 px-4 rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-900 transition-colors">
                  Register
                </button>
                <button onClick={() => navigate("/login")}
                  className="flex-1 py-3 px-4 rounded-lg border border-slate-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                  Login
                </button>
              </div>
              <button onClick={() => setShowAuthModal(false)}
                className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium py-2">
                Maybe Later
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
