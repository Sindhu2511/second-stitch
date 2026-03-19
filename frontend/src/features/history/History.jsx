import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import PageWrapper from "../../components/PageWrapper";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { motion } from "framer-motion";

export default function History() {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }
      
      setUser(user);
      
      // Fetch user's upload history from Supabase
      // This assumes you have a table called 'uploads' or 'results'
      // For now, we'll check sessionStorage as a fallback
      const storedUploads = sessionStorage.getItem("uploadHistory");
      if (storedUploads) {
        setHistory(JSON.parse(storedUploads));
      }
      
      setLoading(false);
    };
    
    fetchUserAndHistory();
  }, [navigate]);

  const handleViewResult = (item) => {
    // Store the image in sessionStorage and navigate to result
    if (item.imageUrl) {
      sessionStorage.setItem("uploadedImage", item.imageUrl);
      navigate("/result");
    }
  };

  const handleDelete = (index) => {
    const newHistory = [...history];
    newHistory.splice(index, 1);
    setHistory(newHistory);
    sessionStorage.setItem("uploadHistory", JSON.stringify(newHistory));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-amber-800">Loading your history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      
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
              <span className="text-4xl">📸</span>
              <h1 className="text-4xl font-bold text-amber-900">
                Your History
              </h1>
            </div>
            <p className="text-amber-700 text-lg">
              View your past uploads and sustainable redesigns
            </p>
          </motion.div>

          {/* History Grid */}
          {history.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    {/* Image */}
                    <div className="aspect-square relative overflow-hidden bg-cream-50">
                      <img 
                        src={item.imageUrl} 
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="bg-amber-900/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded">
                          {item.date || 'Recent'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-bold text-amber-900 mb-1">
                        {item.title || `Design #${index + 1}`}
                      </h3>
                      <p className="text-amber-700 text-sm mb-4 line-clamp-2">
                        {item.description || 'Sustainable redesign from Second Stitch'}
                      </p>
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          variant="secondary" 
                          className="flex-1 text-sm"
                          onClick={() => handleViewResult(item)}
                        >
                          View Result
                        </Button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="px-3 py-2 text-red-500 hover:text-red-700 transition"
                          title="Delete"
                        >
                          🗑️
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
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-2xl font-bold text-amber-900 mb-2">
                  No History Yet
                </h3>
                <p className="text-amber-700 mb-6 max-w-md mx-auto">
                  You haven't uploaded any clothing items yet. Start your sustainable fashion journey by uploading your first item!
                </p>
                <Button onClick={() => navigate("/upload")}>
                  Upload Your First Item
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
              className="text-amber-700 hover:text-amber-900 transition flex items-center justify-center gap-2 mx-auto"
            >
              <span>←</span> Back to Dashboard
            </button>
          </motion.div>
        </div>
      </PageWrapper>
    </div>
  );
}
