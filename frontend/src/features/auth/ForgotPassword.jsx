import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setMessage("Something went wrong.");
    } else {
      setMessage("Password reset email sent. Check your inbox.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-rose-100 to-pink-200">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-rose-700 mb-6">
          Reset Password
        </h2>

        <form onSubmit={handleReset}>
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-xl mb-4"
          />

          <button className="w-full bg-rose-600 text-white p-3 rounded-xl">
            Send Reset Email
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-center text-rose-600">
            {message}
          </p>
        )}

        <p
          onClick={() => navigate("/login")}
          className="text-sm text-center mt-6 cursor-pointer hover:underline"
        >
          Back to Login
        </p>
      </div>
    </div>
  );
}
