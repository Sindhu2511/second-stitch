import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import PageWrapper from "../../components/PageWrapper";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { motion } from "framer-motion";
import { Upload, Plus, Leaf, Trophy, HelpCircle } from "lucide-react";
import Project from "./Project";
import CreateProjectModal from "./CreateProjectModal";
import SustainabilityImpact from "../../components/SustainabilityImpact";
import Achievements from "../../components/Achievements";
import OnboardingTutorial from "../../components/OnboardingTutorial";


export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [showImpact, setShowImpact] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const impactRef = React.useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        // In a real app, you would fetch projects and uploads from Supabase
        // Example:
        // const { data: fetchedProjects, error: projectsError } = await supabase.from('projects').select('*').eq('user_id', user.id);
        // const { data: fetchedUploads, error: uploadsError } = await supabase.from('uploads').select('*').eq('user_id', user.id);
        // if (!projectsError) setProjects(fetchedProjects);
        // if (!uploadsError) setUploads(fetchedUploads);

        // For now, setting empty arrays as mocks are removed
        setProjects([]);
        setUploads([]);

        // Mock stats for achievements - in real app, fetch from DB
        // This would track: upcycles, co2Saved, waterSaved, sharesCount, uploadsCount, likesCount, weeklyUploads

      } else {
        navigate("/login");
      }
      
      // Check if user has seen onboarding tutorial
      const hasSeenTutorial = localStorage.getItem("onboarding_completed");
      if (!hasSeenTutorial) {
        setShowTutorial(true);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  const groupedProjects = useMemo(() => {
    const projectMap = new Map(projects.map(p => [p.id, { ...p, uploads: [] }]));
    const uncategorized = { id: null, name: "Uncategorized", uploads: [] };

    for (const upload of uploads) {
      if (upload.project_id && projectMap.has(upload.project_id)) {
        projectMap.get(upload.project_id).uploads.push(upload);
      } else {
        uncategorized.uploads.push(upload);
      }
    }

    const result = Array.from(projectMap.values());
    if (uncategorized.uploads.length > 0) {
      result.push(uncategorized);
    }
    return result;
  }, [projects, uploads]);

  const handleCreateProject = async (projectName) => {
    // In a real app, you would save the new project to Supabase
    // Example:
    // const { data, error } = await supabase.from('projects').insert([{ name: projectName, user_id: user.id }]);
    // if (!error && data) {
    //   setProjects(prev => [...prev, data[0]]); // Assuming data returns the inserted row
    // } else {
    //   console.error("Error creating project:", error);
    // }

    // For now, optimistically add to local state with a temporary ID
    const newProject = {
      id: Date.now(), // temporary ID
      name: projectName,
      user_id: user.id, // Assuming user is available
    };
    setProjects(prev => [...prev, newProject]);
    console.log("Creating project (mocked):", projectName);
    setModalOpen(false);
  };

  // Get user's first name from metadata
  const getUserName = () => {
    const fullName = user?.user_metadata?.full_name;
    if (fullName) {
      return fullName.split(" ")[0]; // Get first name
    }
    return user?.email?.split("@")[0] || "there";
  };

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return "Good morning";
    } else if (hour >= 12 && hour < 17) {
      return "Good afternoon";
    } else if (hour >= 17 && hour < 21) {
      return "Good evening";
    } else {
      return "Burning the midnight oil";
    }
  };

  const userName = getUserName();
  const greeting = getGreeting();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-rose-100 to-pink-200">
        <div className="h-12 w-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <CreateProjectModal 
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateProject}
      />
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-100 to-pink-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 transition-colors">
        {/* Soft Background Blur Effects */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-pink-300 opacity-30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-rose-300 opacity-30 rounded-full blur-3xl"></div>

        <PageWrapper>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="container mx-auto px-6 py-16 relative z-10"
          >
            {/* Welcome Section */}
            <div className="mb-16 flex justify-between items-start">
              <div>
                <h1 className="text-5xl font-extrabold bg-gradient-to-r from-rose-700 to-pink-500 bg-clip-text text-transparent mb-4">
                  {greeting}, {userName}!
                </h1>
                <p className="text-lg text-rose-700 dark:text-white/80">
                  Manage your sustainable wardrobe beautifully.
                </p>
              </div>
              <button
                onClick={() => setShowTutorial(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all text-rose-700 dark:text-white"
              >
                <HelpCircle size={18} />
                <span className="text-sm font-medium">Help</span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
              <Card className="p-8 bg-white/70 dark:bg-gray-800 backdrop-blur-md border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-pink-100 mb-5">
                  <Upload className="text-rose-700 dark:text-white" size={22} />
                </div>
                <h3 className="text-xl font-semibold text-rose-700 dark:text-white mb-2">
                  Upload New Item
                </h3>
                <p className="text-rose-700 dark:text-white/70 mb-6">
                  Start a new redesign by uploading a clothing item.
                </p>
                <Button onClick={() => navigate("/upload")} className="bg-rose-600 hover:bg-rose-700 rounded-xl">
                  Start Upload
                </Button>
              </Card>

              <Card className="p-8 bg-white/70 dark:bg-gray-800 backdrop-blur-md border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-pink-100 mb-5">
                  <Plus className="text-rose-700 dark:text-white" size={22} />
                </div>
                <h3 className="text-xl font-semibold text-rose-700 dark:text-white mb-2">
                  Create New Project
                </h3>
                <p className="text-rose-700 dark:text-white/70 mb-6">
                  Organize your uploads into collections or projects.
                </p>
                <Button variant="secondary" onClick={() => setModalOpen(true)} className="rounded-xl">
                  Create Project
                </Button>
              </Card>

              <Card className="p-8 bg-white/70 dark:bg-gray-800 backdrop-blur-md border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-amber-100 mb-5">
                  <Trophy className="text-amber-600" size={22} />
                </div>
                <h3 className="text-xl font-semibold text-rose-700 dark:text-white mb-2">
                  Achievements
                </h3>
                <p className="text-rose-700 dark:text-white/70 mb-6">
                  Track your progress and unlock badges.
                </p>
                <Button variant="secondary" onClick={() => {
                  setShowAchievements(!showAchievements);
                  if (!showAchievements) {
                    setTimeout(() => {
                      impactRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }} className="rounded-xl">
                  {showAchievements ? 'Hide Achievements' : 'View Achievements'}
                </Button>
              </Card>

              <Card className="p-8 bg-white/70 dark:bg-gray-800 backdrop-blur-md border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-100 mb-5">
                  <Leaf className="text-emerald-600" size={22} />
                </div>
                <h3 className="text-xl font-semibold text-rose-700 dark:text-white mb-2">
                  Sustainability Impact
                </h3>
                <p className="text-rose-700 dark:text-white/70 mb-6">
                  Track your environmental contribution.
                </p>
                <Button variant="secondary" onClick={() => {
                  setShowImpact(!showImpact);
                  if (!showImpact) {
                    setTimeout(() => {
                      impactRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }} className="rounded-xl">
                  {showImpact ? 'Hide Impact' : 'View Impact'}
                </Button>
              </Card>
            </div>

            {/* Projects Section */}
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-rose-700 dark:text-white mb-8">
                Your Projects
              </h2>
              {groupedProjects.length > 0 ? (
                groupedProjects.map((project) => (
                  <Project key={project.id || 'uncategorized'} project={project} />
                ))
              ) : (
                <div className="text-center py-16 text-rose-700 dark:text-white/70 bg-white/50 dark:bg-gray-800/70 rounded-2xl">
                  <p className="text-lg font-medium mb-2">
                    No projects yet.
                  </p>
                  <p className="text-sm">
                    Create your first project to get started!
                  </p>
                </div>
              )}
            </div>

            {/* Sustainability Impact Section */}
            {showImpact && (
            <motion.div
              ref={impactRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-20"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-100">
                  <Leaf className="text-emerald-600" size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-rose-700 dark:text-white">
                    Your Sustainability Impact
                  </h2>
                  <p className="text-rose-600 dark:text-white/70">
                    Here's how your upcycling journey is making a difference
                  </p>
                </div>
              </div>
              
              <SustainabilityImpact totalUploads={uploads.length} />
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 p-6 bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-white/40"
              >
                <p className="text-sm text-rose-700 dark:text-white/80 text-center">
                  💚 <span className="font-semibold">Keep upcycling!</span> Every item you save from landfill makes a real difference. 
                  The average upcycled garment saves <span className="font-bold">2.5L of water</span> and reduces <span className="font-bold">12.5kg of CO₂</span> emissions.
                </p>
              </motion.div>
            </motion.div>
            )}

            {/* Achievements Section */}
            {showAchievements && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-20"
              >
                <div className="bg-white rounded-3xl p-8 shadow-xl">
                  <Achievements 
                    stats={{
                      totalUpcycles: uploads.length,
                      co2Saved: uploads.length * 12.5,
                      waterSaved: uploads.length * 2500,
                      sharesCount: 0,
                      uploadsCount: uploads.length,
                      likesCount: 0,
                      weeklyUploads: uploads.length
                    }} 
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        </PageWrapper>
      </div>

      <OnboardingTutorial 
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={() => localStorage.setItem("onboarding_completed", "true")}
      />
    </>
  );
}
