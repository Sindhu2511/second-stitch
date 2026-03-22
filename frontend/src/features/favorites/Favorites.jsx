import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import PageWrapper from "../../components/PageWrapper";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { motion } from "framer-motion";
import { Heart, Trash2, Image, Calendar } from "lucide-react";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/login");
          return;
        }

        const { data, error } = await supabase
          .from("favorites")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setFavorites(data || []);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [navigate]);

  const handleRemoveFavorite = async (id) => {
    setRemoving(id);
    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setFavorites((prev) => prev.filter((fav) => fav.id !== id));
    } catch (error) {
      console.error("Error removing favorite:", error);
    } finally {
      setRemoving(null);
    }
  };

  const handleViewDesign = (favorite) => {
    // Store the design in sessionStorage to view on Result page
    if (favorite.original_image) {
      sessionStorage.setItem("uploadedImage", favorite.original_image);
      sessionStorage.setItem("favoriteId", favorite.id);
      navigate("/result");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-rose-100 to-pink-200">
        <div className="h-12 w-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-100 to-pink-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 transition-colors">
      <PageWrapper>
        <div className="container mx-auto px-6 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-2">
              <Heart className="text-rose-600" size={36} />
              <h1 className="text-4xl font-bold text-rose-700 dark:text-white">
                Saved Designs
              </h1>
            </div>
            <p className="text-rose-600 dark:text-white/70 text-lg">
              Your favorite upcycled designs
            </p>
          </motion.div>

          {/* Favorites Grid */}
          {favorites.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite, index) => (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    {/* Image */}
                    <div 
                      className="aspect-square relative overflow-hidden bg-rose-50 cursor-pointer group"
                      onClick={() => handleViewDesign(favorite)}
                    >
                      <img 
                        src={favorite.original_image} 
                        alt={favorite.title || "Saved design"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-white font-semibold bg-rose-600 px-4 py-2 rounded-full transition-opacity">
                          View Design
                        </span>
                      </div>

                      {/* Heart badge */}
                      <div className="absolute top-3 right-3">
                        <span className="bg-rose-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <Heart size={12} fill="white" />
                          Saved
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-bold text-rose-900 dark:text-white mb-1 line-clamp-1">
                        {favorite.title || `Design #${index + 1}`}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-rose-600 dark:text-white/60 text-sm mb-4">
                        <Calendar size={14} />
                        {new Date(favorite.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          variant="secondary" 
                          className="flex-1 text-sm"
                          onClick={() => handleViewDesign(favorite)}
                        >
                          View
                        </Button>
                        <button
                          onClick={() => handleRemoveFavorite(favorite.id)}
                          disabled={removing === favorite.id}
                          className="px-3 py-2 text-red-500 hover:text-red-700 transition disabled:opacity-50"
                          title="Remove from favorites"
                        >
                          {removing === favorite.id ? (
                            <div className="h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-rose-100 flex items-center justify-center">
                  <Heart className="text-rose-400" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-rose-700 dark:text-white mb-2">
                  No Saved Designs Yet
                </h3>
                <p className="text-rose-600 dark:text-white/70 mb-6 max-w-md mx-auto">
                  Start saving your favorite upcycled designs! Click the heart icon on any design to save it here.
                </p>
                <Button onClick={() => navigate("/upload")}>
                  Upload & Create
                </Button>
              </Card>
            </motion.div>
          )}

          {/* Back to Dashboard */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 text-center"
          >
            <button
              onClick={() => navigate("/dashboard")}
              className="text-rose-700 dark:text-white/70 hover:text-rose-900 dark:hover:text-white transition flex items-center justify-center gap-2 mx-auto"
            >
              <span>←</span> Back to Dashboard
            </button>
          </motion.div>
        </div>
      </PageWrapper>
    </div>
  );
}
