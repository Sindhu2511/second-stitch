import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
<<<<<<< HEAD
import { useAuth } from "../../contexts/AuthContext";

export default function AppLayout() {
  const { user } = useAuth();
  
=======
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AppLayout() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

>>>>>>> 3ffa66175ae21fed617880b61e557649a25d6618
  return (
    <div className="min-h-screen transition-colors duration-300">
      <Navbar user={user} />
      <Outlet />
    </div>
  );
}
