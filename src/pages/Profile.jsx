import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Trash2, RotateCcw, ChevronRight, Sprout, Flame, Trophy, LogOut, Mail, Pencil, Check, X } from "lucide-react";
import { useGarden } from "../context/GardenContext";
import { useAuth } from "../context/AuthContext";
import { getLongestStreak, getGardenHealth } from "../lib/habitStore";
import BottomNav from "../components/BottomNav";

export default function Profile() {
  const navigate = useNavigate();
  const { habits, userName, resetGarden } = useGarden();
  const { user, signOut, updateDisplayName } = useAuth();
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(userName);
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState("");

  const totalCompletions = habits.reduce((sum, h) => sum + h.totalCompletions, 0);
  const longestStreak = getLongestStreak(habits);
  const health = getGardenHealth(habits);

  async function handleReset() {
    setConfirmReset(false);
    await resetGarden();
  }

  async function handleLogout() {
    setSigningOut(true);
    try {
      await signOut();
      // AuthContext's listener will redirect to /auth automatically.
    } finally {
      setSigningOut(false);
      setConfirmLogout(false);
    }
  }

  function startEditingName() {
    setNameDraft(userName);
    setNameError("");
    setEditingName(true);
  }

  async function saveName() {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setNameError("Name can't be empty.");
      return;
    }
    setSavingName(true);
    setNameError("");
    try {
      await updateDisplayName(trimmed);
      setEditingName(false);
    } catch {
      setNameError("Couldn't save your name. Try again.");
    } finally {
      setSavingName(false);
    }
  }

  return (
    <div className="min-h-screen bg-garden-gradient pb-32">
      <div className="px-5 pt-6 pb-2">
        <h1 className="font-display text-2xl font-bold text-garden-forest">Profile</h1>
      </div>

      <div className="px-5 mt-4">
        {/* Profile card */}
        <div className="bg-white rounded-3xl shadow-card p-6 flex flex-col items-center mb-5">
          <div className="w-20 h-20 rounded-full bg-garden-sage flex items-center justify-center mb-3">
            <User size={32} className="text-garden-forest" />
          </div>

          {editingName ? (
            <div className="w-full max-w-[240px]">
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveName()}
                  maxLength={40}
                  className="flex-1 bg-garden-mint rounded-full px-4 py-2 text-sm font-semibold text-garden-ink text-center outline-none focus:ring-2 focus:ring-garden-leaf/40"
                  disabled={savingName}
                />
                <button
                  onClick={saveName}
                  disabled={savingName}
                  aria-label="Save name"
                  className="w-8 h-8 rounded-full bg-garden-forest text-white flex items-center justify-center shrink-0 disabled:opacity-60"
                >
                  <Check size={15} strokeWidth={3} />
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  disabled={savingName}
                  aria-label="Cancel"
                  className="w-8 h-8 rounded-full bg-garden-mint text-garden-muted flex items-center justify-center shrink-0 disabled:opacity-60"
                >
                  <X size={15} strokeWidth={3} />
                </button>
              </div>
              {nameError && <p className="text-xs text-garden-terracotta mt-2 text-center">{nameError}</p>}
            </div>
          ) : (
            <button
              onClick={startEditingName}
              className="flex items-center gap-1.5 group"
              aria-label="Edit display name"
            >
              <h2 className="font-display font-bold text-lg text-garden-ink">{userName}</h2>
              <Pencil size={13} className="text-garden-faint group-hover:text-garden-leaf transition-colors" />
            </button>
          )}

          {user?.email && (
            <p className="text-xs text-garden-muted mt-0.5 flex items-center gap-1">
              <Mail size={12} />
              {user.email}
            </p>
          )}
        </div>

        {/* Lifetime stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <MiniStat icon={<Sprout size={18} className="text-garden-forest" />} value={habits.length} label="Plants" />
          <MiniStat icon={<Flame size={18} className="text-garden-terracotta" />} value={longestStreak} label="Best Streak" />
          <MiniStat icon={<Trophy size={18} className="text-garden-amber" />} value={totalCompletions} label="Completions" />
        </div>

        {/* Garden health summary */}
        <div className="bg-white rounded-2xl shadow-soft p-4 flex items-center justify-between mb-5">
          <div>
            <p className="text-sm font-semibold text-garden-ink">Today's Garden Health</p>
            <p className="text-xs text-garden-muted">Based on today's completions</p>
          </div>
          <span className="font-display font-bold text-xl text-garden-forest">{health}%</span>
        </div>

        {/* Settings list */}
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden mb-5">
          <SettingsRow
            icon={<Sprout size={18} className="text-garden-leaf" />}
            label="Manage Habits"
            onClick={() => navigate("/growth")}
          />
          <div className="h-px bg-garden-border mx-4" />
          <SettingsRow
            icon={<RotateCcw size={18} className="text-garden-leaf" />}
            label="Reset Garden Data"
            danger
            onClick={() => setConfirmReset(true)}
          />
          <div className="h-px bg-garden-border mx-4" />
          <SettingsRow
            icon={<LogOut size={18} className="text-garden-leaf" />}
            label="Log Out"
            onClick={() => setConfirmLogout(true)}
          />
        </div>

        <p className="text-center text-xs text-garden-faint mb-4">
          Habit Garden · Synced to your account across devices.
        </p>
      </div>

      {confirmReset && (
        <ConfirmDialog
          title="Reset your garden?"
          body="This will permanently remove all habits, streaks, and growth progress from your account."
          confirmLabel="Reset"
          confirmIcon={<Trash2 size={15} />}
          onCancel={() => setConfirmReset(false)}
          onConfirm={handleReset}
        />
      )}

      {confirmLogout && (
        <ConfirmDialog
          title="Log out?"
          body="You'll need to log back in to see your garden again."
          confirmLabel={signingOut ? "Logging out..." : "Log Out"}
          confirmIcon={<LogOut size={15} />}
          onCancel={() => setConfirmLogout(false)}
          onConfirm={handleLogout}
          disabled={signingOut}
        />
      )}

      <BottomNav />
    </div>
  );
}

function ConfirmDialog({ title, body, confirmLabel, confirmIcon, onCancel, onConfirm, disabled }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-[430px] mx-auto px-6">
        <div className="bg-white rounded-3xl p-6 shadow-lift mb-6 sm:mb-0">
          <h3 className="font-display font-semibold text-lg text-garden-ink mb-2">{title}</h3>
          <p className="text-sm text-garden-muted mb-5">{body}</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={disabled}
              className="flex-1 py-3 rounded-full bg-garden-mint text-garden-forest font-semibold text-sm disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={disabled}
              className="flex-1 py-3 rounded-full bg-garden-terracotta text-white font-semibold text-sm flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              {confirmIcon}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, value, label }) {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-3.5 flex flex-col items-center text-center">
      {icon}
      <p className="font-bold text-lg text-garden-ink mt-1.5 leading-none">{value}</p>
      <p className="text-[10px] font-medium text-garden-muted uppercase tracking-wide mt-1">{label}</p>
    </div>
  );
}

function SettingsRow({ icon, label, onClick, danger }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
      <div className="w-9 h-9 rounded-full bg-garden-mint flex items-center justify-center shrink-0">{icon}</div>
      <span className={`flex-1 text-[15px] font-medium ${danger ? "text-garden-terracotta" : "text-garden-ink"}`}>
        {label}
      </span>
      <ChevronRight size={16} className="text-garden-faint" />
    </button>
  );
}
