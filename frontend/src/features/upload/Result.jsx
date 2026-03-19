import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import PageWrapper from "../../components/PageWrapper";
import Card from "../../components/ui/Card";
import ShareButton from "../../components/ShareButton";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Heart, Download, Share2, RotateCcw } from "lucide-react";
import html2canvas from "html2canvas";

export default function Result() {
  const [slider, setSlider] = useState(50);
  const [uploaded, setUploaded] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const comparisonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const img = sessionStorage.getItem("uploadedImage");
    const assignedProjectId = sessionStorage.getItem("assignedProjectId");

    if (!img) {
      navigate("/upload");
      return;
    }
    setUploaded(img);
    
    console.log("Displaying result for project ID:", assignedProjectId);

    // Check if this design is already favorited
    const checkFavorite = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && img) {
          const { data } = await supabase
            .from("favorites")
            .select("id")
            .eq("user_id", user.id)
            .eq("original_image", img)
            .limit(1);
          
          if (data && data.length > 0) {
            setIsFavorite(true);
          }
        }
      } catch (error) {
        console.error("Error checking favorite:", error);
      }
    };
    
    checkFavorite();
  }, [navigate]);

  const saveDesign = async () => {
    if (comparisonRef.current) {
      const canvas = await html2canvas(comparisonRef.current, {
        useCORS: true,
        scale: 2,
      });
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

      if (!sessionData?.session?.user) {
        console.log("No user found, showing modal"); // Debug log
        setShowAuthModal(true);
        return;
      }


      const user = sessionData.session.user;

      setSavingFavorite(true);
      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("original_image", uploaded);
        setIsFavorite(false);
      } else {
        // Add to favorites
        await supabase
          .from("favorites")
          .insert([{
            user_id: user.id,
            original_image: uploaded,
            title: "Upcycled Design"
          }]);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setSavingFavorite(false);
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6 bg-gradient-to-br from-cream-100 via-amber-50 to-orange-50">
        
        <Card className="p-6 md:p-10 glass max-w-2xl w-full flex flex-col items-center shadow-lg border border-white/40">
          {/* Header */}
          <div className="text-center mb-8 w-full">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-2">Your Upcycled Design</h1>
            <p className="text-gray-600 text-base">Drag the slider to compare the original and AI redesign</p>
          </div>

          {/* COMPARISON BOX */}
          <div 
            ref={comparisonRef}
            className="relative w-full aspect-square max-h-[500px] rounded-lg overflow-hidden border border-gray-200 shadow-md bg-white mb-8"
          >
            {/* Original side */}
            <div 
              className="absolute inset-0 z-10 overflow-hidden" 
              style={{ width: `${slider}%` }}
            >
              <img 
                src={uploaded} 
                className="absolute inset-0 w-full h-full object-cover" 
                alt="Original" 
                style={{ width: `${100 / (slider / 100)}%`, maxWidth: 'none' }} 
              />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded">
                ORIGINAL
              </div>
            </div>

            {/* AI side */}
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center" />
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded">
              AI REDESIGN
            </div>

            {/* Slider Handle */}
            <div className="absolute top-0 bottom-0 z-20 w-0.5 bg-gray-300" style={{ left: `${slider}%` }}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-2 border-gray-400 shadow-lg flex items-center justify-center cursor-ew-resize hover:border-gray-600 transition-colors">
                <span className="text-gray-600 font-bold text-sm">↔</span>
              </div>
            </div>

            <input 
              type="range" 
              min="0" 
              max="100" 
              value={slider} 
              onChange={(e) => setSlider(e.target.value)}
              className="absolute inset-0 z-30 opacity-0 cursor-ew-resize w-full h-full"
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
            {/* Try Another */}
            <motion.button 
              onClick={() => navigate('/upload')}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <RotateCcw size={18} />
              <span className="hidden sm:inline">Try Another</span>
              <span className="sm:hidden">Another</span>
            </motion.button>

            {/* Save Design */}
            <motion.button 
              onClick={saveDesign}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-slate-800 text-white font-semibold text-sm hover:bg-slate-900 active:bg-slate-950 transition-colors shadow-sm"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Save</span>
            </motion.button>

            {/* Favorite */}
            <motion.button 
              onClick={toggleFavorite}
              disabled={savingFavorite}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-sm transition-colors ${
                isFavorite 
                  ? "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800" 
                  : "border border-rose-400 text-rose-600 hover:bg-rose-50 active:bg-rose-100"
              } disabled:opacity-50`}
            >
              {savingFavorite ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
                  <span className="hidden sm:inline">{isFavorite ? "Saved" : "Favorite"}</span>
                </>
              )}
            </motion.button>

            {/* Share */}
            <ShareButton 
              designImage={uploaded}
              title="🌿 My Upcycled Design"
              description="I just transformed an old garment into something beautiful with Second Stitch AI! ♻️"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
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
                <button
                  onClick={() => navigate('/register')}
                  className="flex-1 py-3 px-4 rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-900 transition-colors"
                >
                  Register
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="flex-1 py-3 px-4 rounded-lg border border-slate-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Login
                </button>
              </div>
              
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium py-2"
              >
                Maybe Later
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}