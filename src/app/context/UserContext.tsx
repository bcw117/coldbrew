"use client";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type UserContextType = {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const supabase = createClient();

  const refreshUser = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      setUser(data.user);

      // Try to load LinkedIn URL from localStorage if it exists
      if (typeof window !== "undefined" && data.user) {
        const savedUrl = localStorage.getItem(`linkedin_${data.user.id}`);
        if (savedUrl) {
          setLinkedInUrl(savedUrl);
        }
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);

        // Load LinkedIn URL from localStorage when user signs in
        if (session?.user && typeof window !== "undefined") {
          const savedUrl = localStorage.getItem(`linkedin_${session.user.id}`);
          if (savedUrl) {
            setLinkedInUrl(savedUrl);
          } else {
            setLinkedInUrl("");
          }
        }

        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
