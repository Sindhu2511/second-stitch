import { Navigate } from "react-router-dom";
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

  return session ? children : <Navigate to="/login" replace />;
}
