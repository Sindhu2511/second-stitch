import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useTheme from "../../hooks/useTheme";
import { Heart } from "lucide-react";

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();
  const { darkMode, setDarkMode } = useTheme();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = () => {
    const name =
      user?.user_metadata?.full_name ||
      user?.email ||
      "User";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <nav className="flex justify-between items-center px-8 py-5 bg-white/70 dark:bg-gray-900 backdrop-blur-md sticky top-0 z-50 border-b border-white/30 dark:border-gray-800 shadow-sm transition-colors">
      
      <div
        onClick={() => navigate(user ? "/dashboard" : "/")}
        className="text-2xl font-black text-rose-700 dark:text-white cursor-pointer transition-colors"
      >
        SECOND STITCH
      </div>

      {user ? (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="focus:outline-none"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-400 flex items-center justify-center text-white font-semibold shadow-md">
              {getInitials()}
            </div>
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors"
              >
                <div className="px-5 py-4 border-b dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user.user_metadata?.full_name || "Style Icon"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {user.email}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/dashboard");
                  }}
                  className="w-full text-left px-5 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Dashboard
                </button>

                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/profile");
                  }}
                  className="w-full text-left px-5 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Profile
                </button>

                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/favorites");
                  }}
                  className="w-full text-left px-5 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
                >
                  <Heart size={16} />
                  Saved Designs
                </button>

                {/* 🌙 DARK MODE TOGGLE */}
                <div className="px-5 py-3 flex items-center justify-between border-t dark:border-gray-700">
                  <span className="text-sm dark:text-gray-200">
                    Dark Mode
                  </span>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`w-10 h-5 flex items-center rounded-full p-1 transition ${
                      darkMode ? "bg-rose-600" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                        darkMode ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setOpen(false);
                    handleSignOut();
                  }}
                  className="w-full text-left px-5 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                >
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-full font-semibold transition shadow-md"
        >
          Sign In
        </button>
      )}
    </nav>
  );
}
