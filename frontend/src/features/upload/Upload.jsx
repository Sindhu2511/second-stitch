import { useRef, useState, useEffect } from "react";
import PageWrapper from "../../components/PageWrapper";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { supabase } from "../../lib/supabaseClient";

export default function Upload() {
  const [preview, setPreview] = useState(null);
  const [usingCamera, setUsingCamera] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      // In a real app, you would fetch projects for the current user from Supabase.
      // Example:
      // const { data: fetchedProjects, error } = await supabase.from('projects').select('*').eq('user_id', user.id);
      // if (!error) setProjects(fetchedProjects);
      // For now, setting an empty array as mock data is removed
      setProjects([]);
    };
    fetchProjects();
  }, []);

  async function startCamera() {
    setUsingCamera(true);
    
    setTimeout(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 } 
          },
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error("Camera Error:", err);
        alert("Camera access denied or not available");
        setUsingCamera(false);
      }
    }, 100); 
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL("image/png");
    setPreview(imageData);

    video.srcObject.getTracks().forEach((track) => track.stop());
    setUsingCamera(false);
  }

  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  const handleProjectChange = (e) => {
    const value = e.target.value;
    if (value === "create_new") {
      setShowNewProjectInput(true);
      setSelectedProjectId(null); // No project selected yet, pending creation
    } else {
      setShowNewProjectInput(false);
      setSelectedProjectId(value === "none" ? null : parseInt(value));
    }
  };

  function handleUpcycle() {
    if (!preview) return;

    let finalProjectId = selectedProjectId;

    if (showNewProjectInput && newProjectName.trim()) {
      // Mock project creation - in a real app, this would be a Supabase insert
      // Example:
      // const { data, error } = await supabase.from('projects').insert([{ name: newProjectName.trim(), user_id: currentUser.id }]);
      // if (!error && data) {
      //   finalProjectId = data[0].id;
      //   setProjects(prev => [...prev, data[0]]);
      // } else {
      //   console.error("Error creating project:", error);
      //   alert("Failed to create new project.");
      //   return;
      // }

      // For now, optimistically add to local state with a temporary ID
      const newId = Date.now(); // Generate a temporary ID
      const newProject = { id: newId, name: newProjectName.trim(), user_id: "123" };
      setProjects(prev => [...prev, newProject]); // Optimistically add to local state
      finalProjectId = newId;

    } else if (showNewProjectInput && !newProjectName.trim()) {
      alert("Please enter a name for the new project.");
      return;
    }

    try { 
      sessionStorage.setItem("uploadedImage", preview); 
      if (finalProjectId) {
        sessionStorage.setItem("assignedProjectId", finalProjectId);
      } else {
        sessionStorage.removeItem("assignedProjectId");
      }
    } catch (e) { 
      console.error("Session storage error:", e);
      // Handle error gracefully, e.g., alert user
    }
    navigate("/processing");
  }

  return (
    <PageWrapper>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-gradient-to-br from-cream-100 via-amber-50 to-orange-50">
        
        {/* ANIMATED BACKGROUND ELEMENTS - Fashion-related animations */}
        <motion.svg
          className="absolute top-20 left-10 w-32 h-40 opacity-20"
          viewBox="0 0 100 140"
        >
          <motion.path
            d="M 30 20 Q 30 10, 40 10 Q 50 10, 50 15 L 50 40 Q 50 50, 40 55 L 35 85 Q 35 95, 40 100 L 30 140 L 20 140 L 25 100 Q 25 95, 30 85 L 25 55 Q 15 50, 15 40 L 15 15 Q 15 10, 25 10 Q 35 10, 35 20 Z"
            stroke="#c9a876"
            strokeWidth="1.5"
            fill="none"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </motion.svg>

        <motion.svg
          className="absolute bottom-32 right-16 w-28 h-36 opacity-25"
          viewBox="0 0 100 140"
        >
          <motion.path
            d="M 25 20 Q 25 10, 50 10 Q 75 10, 75 20 L 75 50 Q 75 60, 60 70 L 55 100 Q 55 115, 50 130 L 45 130 Q 40 115, 40 100 L 35 70 Q 20 60, 20 50 Z"
            stroke="#d4a574"
            strokeWidth="2"
            fill="none"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.svg>

        <motion.svg
          className="absolute inset-0 w-full h-full opacity-30"
          viewBox="0 0 1000 800"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M 0 400 Q 250 350 500 400 T 1000 400"
            stroke="#c9a876"
            strokeWidth="2"
            fill="none"
            animate={{ 
              d: [
                "M 0 400 Q 250 350 500 400 T 1000 400",
                "M 0 400 Q 250 450 500 400 T 1000 400",
                "M 0 400 Q 250 350 500 400 T 1000 400"
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.svg>

        {/* CONTENT AREA */}
        <div className="relative z-10 max-w-xl w-full">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-semibold tracking-tight mb-4 text-amber-900 text-center"
          >
            SECOND STITCH
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-amber-800 mb-10 text-center max-w-lg mx-auto"
          >
            AI Powered Sustainable Wardrobe
          </motion.p>

          {usingCamera && (
              <div className="backdrop-blur-xl bg-white/40 p-4 mb-6 rounded-2xl border border-orange-200/40">
              <video ref={videoRef} autoPlay playsInline muted className="w-80 h-60 object-cover rounded-xl" />
                <button onClick={capturePhoto} className="mt-4 w-full btn">
                Capture
              </button>
            </div>
          )}

          {!usingCamera && (
              <motion.label
                whileHover={{ scale: 1.02 }}
                className="backdrop-blur-xl bg-white/40 w-full max-w-xl h-80 rounded-2xl border border-orange-200/40 hover:scale-[1.01] transition-transform duration-500 cursor-pointer flex items-center justify-center"
              >
              {!preview ? (
                <div className="text-center">
                  <div className="h-16 mb-4" />
                  <p className="font-semibold text-amber-900">Click to upload</p>
                  <p className="text-sm text-amber-700/70">or use your camera</p>
                </div>
              ) : (
                <img src={preview} alt="Preview" className="h-full object-contain rounded-xl" />
              )}
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </motion.label>
          )}

          {/* Project Selection */}
          <div className="mt-8 mb-6">
            <label htmlFor="project-select" className="block text-sm font-medium text-amber-900 mb-2">
              Assign to Project
            </label>
            <select
              id="project-select"
              className="w-full p-3 border border-orange-200 rounded-lg bg-white/60 dark:bg-gray-800/60 text-amber-900 dark:text-white/80 focus:ring-amber-500 focus:border-amber-500"
              onChange={handleProjectChange}
              value={selectedProjectId || (showNewProjectInput ? "create_new" : "none")}
            >
              <option value="none">None (Uncategorized)</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
              <option value="create_new">Create New Project...</option>
            </select>
            {showNewProjectInput && (
              <Input
                type="text"
                placeholder="Enter new project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="mt-3 w-full"
              />
            )}
          </div>

          <div className="flex gap-4 mt-8 justify-center">
            {!usingCamera && (
                <button onClick={startCamera} className="btn-ghost px-6 py-3 rounded-full border border-amber-600/40 hover:border-amber-600/60 text-amber-900 transition font-semibold">
                  Use Camera
                </button>
              )}

              {preview && (
                <button
                  onClick={handleUpcycle}
                  className="btn px-8 py-3 rounded-full font-semibold shadow-lg vintage-pulse btn-premium"
                >
                  Upcycle with AI
                </button>
              )}
            </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </PageWrapper>
  );
}
