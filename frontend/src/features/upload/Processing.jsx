import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/PageWrapper";
import Card from "../../components/ui/Card";

const steps = [
  "Analyzing fabric texture",
  "Identifying stitch patterns",
  "Detecting wear and tear",
  "Generating sustainable redesign",
  "Finalizing upcycled look",
];

export default function Processing() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const uploadedImage = sessionStorage.getItem("uploadedImage");
    const assignedProjectId = sessionStorage.getItem("assignedProjectId");

    if (!uploadedImage) {
      navigate("/upload"); // Redirect if no image is found
      return;
    }

    // In a real application, you would send `uploadedImage` and `assignedProjectId`
    // to your backend for AI processing. The AI's result would then be
    // associated with this `assignedProjectId` in your database.
    console.log("Processing image for project ID:", assignedProjectId);


    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 1200);

    const timeout = setTimeout(() => {
      navigate("/result");
    }, 6500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <PageWrapper>
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden bg-gradient-to-br from-cream-100 via-amber-50 to-orange-50">
        
        {/* ... (Keep existing animated background SVGs) ... */}

        <Card className="relative z-10 p-12 flex flex-col items-center justify-center max-w-lg w-full glass">
          
          {/* NEW: Stitching Animation */}
          <div className="relative w-48 h-48 mb-8">
            {/* The "Garment" Circle */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke="url(#stitchGradient)" 
                strokeWidth="0.5" 
                strokeDasharray="4 2"
                className="opacity-30"
              />
              <defs>
                <linearGradient id="stitchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c9a876" />
                  <stop offset="100%" stopColor="#8b7355" />
                </linearGradient>
              </defs>
              
              {/* Animated Stitch Line */}
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#b85a2b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="1 6"
                initial={{ pathLength: 0, rotate: 0 }}
                animate={{ 
                  pathLength: [0, 1],
                  rotate: 360 
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              />

              {/* The "Needle" */}
              <motion.circle
                cx="95"
                cy="50"
                r="1.5"
                fill="#3b2f2a"
                animate={{ rotate: 360 }}
                style={{ originX: "50px", originY: "50px" }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            </svg>
            
            {/* Centered Pulse */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 bg-amber-200/40 rounded-full blur-2xl"
              />
            </div>
          </div>

          <motion.div 
            key={step} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-2"
          >
            <p className="text-2xl font-bold text-amber-900 tracking-tight">
              {steps[step]}
            </p>
            <div className="flex justify-center gap-1">
              {steps.map((_, i) => (
                <motion.div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i <= step ? "w-4 bg-amber-600" : "w-2 bg-amber-200"
                  }`}
                />
              ))}
            </div>
          </motion.div>

          <p className="text-sm text-amber-800/70 mt-6 font-medium uppercase tracking-widest">
            Crafting Sustainability
          </p>
        </Card>
      </div>
    </PageWrapper>
  );
}