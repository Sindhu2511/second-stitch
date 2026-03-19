import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Landing from "./features/home/Landing";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import Upload from "./features/upload/Upload";
import Result from "./features/upload/Result";
import Processing from "./features/upload/Processing";
import Dashboard from "./features/dashboard/Dashboard";
import History from "./features/history/History";
import Profile from "./features/profile/Profile";
import ForgotPassword from "./features/auth/ForgotPassword";
import ResetPassword from "./features/auth/ResetPassword";
import Favorites from "./features/favorites/Favorites";

import AnimatedBackground from "./components/AnimatedBackground";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";

export default function App() {
  const location = useLocation();

  return (
    <>
      <AnimatedBackground />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          {/* ALL pages share Navbar */}
          <Route element={<AppLayout />}>

            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/processing" element={<Processing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              }
            />

            <Route path="/upload" element={<Upload />} />
            <Route path="/result" element={<Result />} />


            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />

          </Route>
        </Routes>
      </AnimatePresence>
    </>
  );
}
