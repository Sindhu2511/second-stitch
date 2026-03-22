import { Navigate } from "react-router-dom";
<<<<<<< HEAD
import { useAuth } from "../../contexts/AuthContext"

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
=======
import { supabase } from "../../lib/supabaseClient";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
  }, []);

  if (session === undefined) return null;
>>>>>>> 3ffa66175ae21fed617880b61e557649a25d6618

  return session ? children : <Navigate to="/login" replace />;
}
