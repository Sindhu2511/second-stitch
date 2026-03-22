import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setMessage("Failed to update password.");
    } else {
      setMessage("Password updated successfully!");
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-rose-100 to-pink-200">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-rose-700 mb-6">
          Set New Password
        </h2>

        <form onSubmit={handleUpdate}>
          <input
            type="password"
            placeholder="New password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-xl mb-4"
          />

          <button className="w-full bg-rose-600 text-white p-3 rounded-xl">
            Update Password
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-center text-rose-600">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
