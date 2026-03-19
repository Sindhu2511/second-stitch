import PageWrapper from "../../components/PageWrapper";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { supabase } from "../../lib/supabaseClient";


export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

const handleSignIn = async (e) => {
  e.preventDefault();
  setLoading(true);
  setErrorMessage("");

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setErrorMessage("Invalid email or password");
    setLoading(false);
  } else {
    navigate("/dashboard");
  }
};


  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-gradient-to-br from-cream-100 via-amber-50 to-orange-50">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-20 w-full max-w-md"
        >
          <Card className="p-8">

            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold text-amber-900">
                SECOND STITCH
              </h1>
            </div>

            <h2 className="text-3xl font-bold text-center text-amber-900 mb-2">
              Welcome back
            </h2>

            <p className="text-sm text-amber-800 text-center mb-8">
              AI Powered Sustainable Wardrobe
            </p>

            <form onSubmit={handleSignIn} autoComplete="on">

              {/* Email */}
              <div className="mb-4">
                <label className="text-sm font-semibold text-amber-900 mb-2 block">
                  Email
                </label>
                <Input
                  name="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="text-sm font-semibold text-amber-900 mb-2 block">
                  Password
                </label>

                <div className="relative">
                  <Input
                    name="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-amber-700/70 hover:text-amber-900 text-sm"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* 🔥 Remember Me Toggle */}
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center gap-2 text-sm text-amber-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="accent-amber-700 w-4 h-4"
                  />
                  Remember me
                </label>

                <span
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs text-amber-700/70 cursor-pointer hover:underline"
                >
                  Forgot password?
                </span>

              </div>

              {/* Error */}
              {errorMessage && (
                <p className="text-sm text-red-600 mb-4 text-center">
                  {errorMessage}
                </p>
              )}

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn w-full"
              >
                {loading ? "Logging in..." : "Log in"}
              </button>

            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-amber-300/40"></div>
              <span className="text-xs text-amber-700/60">or</span>
              <div className="flex-1 h-px bg-amber-300/40"></div>
            </div>

            <div className="text-center">
              <p className="text-sm text-amber-900">
                Don't have an account?{" "}
                <span
                  onClick={() => navigate("/register")}
                  className="font-semibold text-orange-700 cursor-pointer hover:text-orange-900 transition"
                >
                  Sign up
                </span>
              </p>
            </div>

            <p className="text-xs text-amber-700/50 text-center mt-6">
              By logging in, you agree to our Terms & Privacy Policy
            </p>

          </Card>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
