import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import {
  fetchHabits,
  insertHabit,
  updateHabitRow,
  deleteHabitRow,
  deleteAllHabits,
} from "../lib/supabaseHabits";
import { toggleCompletion } from "../lib/habitStore";

const GardenContext = createContext(null);

export function GardenProvider({ children }) {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reload habits whenever the logged-in user changes (login, logout, switch account).
  useEffect(() => {
    if (!user) {
      setHabits([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchHabits()
      .then((data) => {
        if (!cancelled) setHabits(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const addHabit = useCallback(
    async (fields) => {
      if (!user) return;
      const created = await insertHabit(fields, user.id);
      setHabits((prev) => [created, ...prev]);
      return created;
    },
    [user]
  );

  const markDone = useCallback(
    async (id) => {
      if (!user) return;
      const current = habits.find((h) => h.id === id);
      if (!current) return;

      const optimistic = toggleCompletion(current);
      // Update the screen immediately, then confirm with the DB.
      setHabits((prev) => prev.map((h) => (h.id === id ? optimistic : h)));

      try {
        const saved = await updateHabitRow(optimistic, user.id);
        setHabits((prev) => prev.map((h) => (h.id === id ? saved : h)));
      } catch (e) {
        // Roll back on failure so the UI never lies about what's actually saved.
        setHabits((prev) => prev.map((h) => (h.id === id ? current : h)));
        setError(e.message);
      }
    },
    [user, habits]
  );

  const deleteHabit = useCallback(async (id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    try {
      await deleteHabitRow(id);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  const resetGarden = useCallback(async () => {
    if (!user) return;
    setHabits([]);
    try {
      await deleteAllHabits(user.id);
    } catch (e) {
      setError(e.message);
    }
  }, [user]);

  const value = {
    habits,
    loading,
    error,
    addHabit,
    markDone,
    deleteHabit,
    resetGarden,
    userName: user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Friend",
  };

  return <GardenContext.Provider value={value}>{children}</GardenContext.Provider>;
}

export function useGarden() {
  const ctx = useContext(GardenContext);
  if (!ctx) throw new Error("useGarden must be used within GardenProvider");
  return ctx;
}
