import React, { useEffect, useState } from "react";
import { http } from "../api/http";
import { clearToken, getToken, setToken } from "./token";
import { AuthContext } from "./auth.context";
import type { User } from "./auth.context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = getToken();
        if (!token) {
          setUser(null);
          return;
        }
        const { data } = await http.get<User>("/auth/me");
        setUser(data);
      } catch {
        clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email: string, password: string) {
    const { data } = await http.post("/auth/login", { email, password });
    setToken(data.access_token);
    setUser(data.user);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}