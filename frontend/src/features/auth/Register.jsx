import PageWrapper from "../../components/PageWrapper";
import { motion } from "framer-motion";
import Card from "../../components/ui/Card";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(""); // ✅ added
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      alert(error.message);
    } else {
      // Since email confirm is off, the user is now logged in!
      // Redirect straight to the landing page.
      navigate("/"); 
    }
  }; // ✅ properly closed function

  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-gradient-to-br from-cream-100 via-amber-50 to-orange-50">

        {/* Background motif */}
        <motion.svg
          className="absolute top-20 left-10 w-32 h-40 opacity-18"
          viewBox="0 0 100 140"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M 30 20 Q 30 10, 40 10 Q 50 10, 50 15 L 50 40 Q 50 50, 40 55 L 35 85 Q 35 95, 40 100 L 30 140 L 20 140 L 25 100 Q 25 95, 30 85 L 25 55 Q 15 50, 15 40 L 15 15 Q 15 10, 25 10 Q 35 10, 35 20 Z"
            stroke="#c9a876"
            strokeWidth="1.2"
            fill="none"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </motion.svg>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-20 w-full max-w-md"
        >
          <Card className="p-8">

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-center mb-6"
            >
              <h1 className="text-5xl font-bold text-amber-900">
                SECOND STITCH
              </h1>
            </motion.div>

            <h2 className="text-2xl font-bold text-center text-amber-900 mb-2">
              Create Account
            </h2>
            <p className="text-sm text-amber-800 text-center mb-6">
              AI Powered Sustainable Wardrobe
            </p>

            <form onSubmit={handleRegister}>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mb-4"
              >
                <label className="text-sm font-semibold text-amber-900 mb-2 block">
                  Full Name
                </label>
                <Input
                  placeholder="Your name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-4"
              >
                <label className="text-sm font-semibold text-amber-900 mb-2 block">
                  Email
                </label>
                <Input
                  placeholder="you@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mb-6"
              >
                <label className="text-sm font-semibold text-amber-900 mb-2 block">
                  Password
                </label>
                <Input
                  placeholder="Create a strong password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </motion.div>

              <div>
                <button
                  type="submit"
                  className="btn-primary-auth rounded-xl font-black shadow-2xl hover:brightness-125 transition-all"
                >
                  Create Account
                </button>
              </div>

            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-amber-300/40"></div>
              <span className="text-xs text-amber-700/60">or</span>
              <div className="flex-1 h-px bg-amber-300/40"></div>
            </div>

            <div className="text-center">
              <p className="text-sm text-amber-900">
                Already have an account?{" "}
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  onClick={() => navigate("/login")}
                  className="font-semibold text-orange-700 cursor-pointer"
                >
                  Log in
                </motion.span>
              </p>
            </div>

          </Card>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
