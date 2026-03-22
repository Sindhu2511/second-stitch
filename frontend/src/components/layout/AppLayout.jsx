import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuth } from "../../contexts/AuthContext";

export default function AppLayout() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen transition-colors duration-300">
      <Navbar user={user} />
      <Outlet />
    </div>
  );
}
