import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { GardenProvider } from "./context/GardenContext";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import AddHabit from "./pages/AddHabit";
import HabitDetail from "./pages/HabitDetail";
import Insights from "./pages/Insights";
import Growth from "./pages/Growth";
import Profile from "./pages/Profile";
import ShareRecap from "./pages/ShareRecap";

// Gates any screen that needs a logged-in user. Unauthenticated visitors
// get bounced to /auth; the session is still loading gets a blank beat
// rather than a flash of the login form.
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <SplashLoader />;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

// Logged-in users shouldn't be able to navigate back to onboarding/auth screens.
function RedirectIfAuthed({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <SplashLoader />;
  if (user) return <Navigate to="/garden" replace />;
  return children;
}

function SplashLoader() {
  return (
    <div className="min-h-screen bg-garden-gradient flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-garden-sage border-t-garden-forest animate-spin" />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RedirectIfAuthed>
            <Onboarding />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/auth"
        element={
          <RedirectIfAuthed>
            <Auth />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/garden"
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      />
      <Route
        path="/add"
        element={
          <RequireAuth>
            <AddHabit />
          </RequireAuth>
        }
      />
      <Route
        path="/habit/:id"
        element={
          <RequireAuth>
            <HabitDetail />
          </RequireAuth>
        }
      />
      <Route
        path="/growth"
        element={
          <RequireAuth>
            <Growth />
          </RequireAuth>
        }
      />
      <Route
        path="/insights"
        element={
          <RequireAuth>
            <Insights />
          </RequireAuth>
        }
      />
      <Route
        path="/share"
        element={
          <RequireAuth>
            <ShareRecap />
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GardenProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </GardenProvider>
    </AuthProvider>
  );
}
