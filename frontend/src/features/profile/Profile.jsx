import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Leaf, 
  Award,
  Save,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import SustainabilityImpact from "../dashboard/SustainabilityImpact";
import PageWrapper from "../../components/PageWrapper";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  // User state
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  // Stats from database
  const [stats, setStats] = useState({
    totalDesigns: 0,
    achievements: 0,
    memberSince: ""
  });
  
  // Password change state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          // Redirect if not logged in
          return;
        }
        
        const currentUser = session.user;
        setUser(currentUser);
        setFullName(currentUser.user_metadata?.full_name || "");
        setAvatarUrl(currentUser.user_metadata?.avatar_url || "");
        
        // Get member since date
        const memberDate = new Date(currentUser.created_at).toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        });
        
        // Fetch real stats from database
        const { data: uploadsData } = await supabase
          .from('uploads')
          .select('id')
          .eq('user_id', currentUser.id);
          
        const { data: achievementsData } = await supabase
          .from('user_achievements')
          .select('id')
          .eq('user_id', currentUser.id);
        
        setStats({
          totalDesigns: uploadsData?.length || 0,
          achievements: achievementsData?.length || 0,
          memberSince: memberDate
        });
        
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const getInitials = () => {
    const name = fullName || user?.email || "User";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        avatar_url: avatarUrl
      }
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage("Profile updated successfully!");
      // Refresh user data
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      setUser(updatedUser);
    }
    setSaving(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match");
      setSaving(false);
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      setSaving(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage("Password changed successfully!");
      setNewPassword("");
      setConfirmPassword("");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
        </div>
      </PageWrapper>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 md:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto space-y-6"
        >
          
          {/* Header */}
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl md:text-4xl font-bold text-rose-900 dark:text-white">
              Profile Settings
            </h1>
            <p className="text-rose-700/70 dark:text-gray-400 mt-1">
              Manage your account and preferences
            </p>
          </motion.div>

          {/* Messages */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400"
            >
              <CheckCircle size={20} />
              {successMessage}
            </motion.div>
          )}

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400"
            >
              <AlertCircle size={20} />
              {errorMessage}
            </motion.div>
          )}

          {/* Profile Header Card */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-500 to-pink-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials()
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-rose-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-rose-700 transition shadow-md">
                    <Camera size={16} />
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setAvatarUrl(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Info */}
                <div className="text-center md:text-left flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {fullName || "Style Icon"}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center md:justify-start gap-2 mt-1">
                    <Mail size={16} />
                    {user?.email}
                  </p>
                  <p className="text-sm text-rose-600 dark:text-rose-400 mt-2">
                    Member since {stats.memberSince}
                  </p>
                </div>

                {/* Real Stats from Database */}
                <div className="flex gap-4">
                  <div className="text-center px-4">
                    <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                      {stats.totalDesigns}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Designs</div>
                  </div>
                  <div className="text-center px-4 border-l border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {stats.achievements}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Badges</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Edit Profile Form */}
            <motion.div variants={itemVariants}>
              <Card className="p-6 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                    <User className="text-white" size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Edit Profile
                  </h3>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter your name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Avatar URL
                    </label>
                    <Input
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full mt-4"
                  >
                    <Save size={18} className="inline mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Card>
            </motion.div>

            {/* Change Password */}
            <motion.div variants={itemVariants}>
              <Card className="p-6 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Lock className="text-white" size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Change Password
                  </h3>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full mt-4"
                  >
                    <Lock size={18} className="inline mr-2" />
                    {saving ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>

          {/* Sustainability Impact */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                  <Leaf className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Your Sustainability Impact
                </h3>
              </div>
              
              <SustainabilityImpact totalUploads={stats.totalDesigns} />
            </Card>
          </motion.div>

          {/* Achievements Summary */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                  <Award className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Your Achievements
                </h3>
              </div>

              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {stats.achievements === 0 ? (
                  <p>Complete uploads to earn achievements!</p>
                ) : (
                  <p>You've earned {stats.achievements} achievement{stats.achievements !== 1 ? 's' : ''}!</p>
                )}
              </div>
            </Card>
          </motion.div>

        </motion.div>
      </div>
    </PageWrapper>
  );
}
