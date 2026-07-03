import { useState } from "react";
import { Sprout, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Auth() {
  const { signUp, signIn } = useAuth();
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        await signUp(email.trim(), password, displayName.trim());
        // Email confirmation is off for this app, so a successful signUp
        // call already returns an active session — no separate login step
        // needed. AuthContext's session listener handles the redirect.
      } else {
        await signIn(email.trim(), password);
        // On success, AuthContext's session listener handles the redirect.
      }
    } catch (err) {
      setError(friendlyError(err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-garden-gradient flex flex-col justify-center px-8 py-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-garden-sage flex items-center justify-center mx-auto mb-4">
          <Sprout size={28} className="text-garden-forest" />
        </div>
        <h1 className="font-display text-2xl font-bold text-garden-forest mb-1">
          {mode === "signup" ? "Plant Your Account" : "Welcome Back"}
        </h1>
        <p className="text-garden-muted text-sm">
          {mode === "signup"
            ? "Create an account to start growing your garden."
            : "Log in to tend to your garden."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "signup" && (
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-garden-leaf" />
            <input
              type="text"
              autoComplete="nickname"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name (optional)"
              maxLength={40}
              className="w-full bg-white rounded-full pl-11 pr-4 py-3.5 text-[15px] text-garden-ink placeholder:text-garden-faint shadow-soft outline-none focus:ring-2 focus:ring-garden-leaf/40 transition-shadow"
            />
          </div>
        )}

        <div className="relative">
          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-garden-leaf" />
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-white rounded-full pl-11 pr-4 py-3.5 text-[15px] text-garden-ink placeholder:text-garden-faint shadow-soft outline-none focus:ring-2 focus:ring-garden-leaf/40 transition-shadow"
          />
        </div>

        <div className="relative">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-garden-leaf" />
          <input
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-white rounded-full pl-11 pr-4 py-3.5 text-[15px] text-garden-ink placeholder:text-garden-faint shadow-soft outline-none focus:ring-2 focus:ring-garden-leaf/40 transition-shadow"
          />
        </div>

        {error && (
          <p className="text-sm text-garden-terracotta bg-orange-50 rounded-xl px-4 py-2.5">{error}</p>
        )}
        {message && (
          <p className="text-sm text-garden-forest bg-garden-sage/60 rounded-xl px-4 py-2.5">{message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-garden-forest text-white font-semibold text-base py-4 rounded-full shadow-button flex items-center justify-center gap-2 active:scale-[0.98] transition-transform duration-150 hover:bg-garden-forestDark disabled:opacity-60 disabled:active:scale-100 mt-2"
        >
          {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Log In"}
          {!loading && <ArrowRight size={18} />}
        </button>
      </form>

      <button
        onClick={() => {
          setMode(mode === "signup" ? "signin" : "signup");
          setError("");
          setMessage("");
        }}
        className="text-center text-sm text-garden-leaf font-medium mt-6 hover:text-garden-forest transition-colors"
      >
        {mode === "signup" ? "Already have an account? Log in" : "New here? Create an account"}
      </button>
    </div>
  );
}

function friendlyError(message) {
  if (!message) return "Something went wrong. Please try again.";
  if (message.includes("Invalid login credentials")) return "Incorrect email or password.";
  if (message.includes("User already registered")) return "An account with this email already exists.";
  if (message.includes("Email not confirmed")) return "Please confirm your email before logging in.";
  return message;
}
