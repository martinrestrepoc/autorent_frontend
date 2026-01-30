import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../auth/useAuth";

type ApiError = { message?: string | string[] };

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("admin@autorent.local");
  const [password, setPassword] = useState("Admin123");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    try {
      await login(email, password);
      nav("/", { replace: true });
    } catch (err: unknown) {
      let msg = "Error al iniciar sesión";

      if (axios.isAxiosError<ApiError>(err)) {
        const data = err.response?.data;
        msg =
          (Array.isArray(data?.message) ? data?.message[0] : data?.message) ||
          msg;
      }

      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Autorent Admin</h1>
          <p className="text-slate-400 text-sm mt-1">
            Inicia sesión para continuar
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-300">Email</label>
            <input
              className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2 outline-none focus:ring-2 focus:ring-slate-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@autorent.local"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Password</label>
            <input
              className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2 outline-none focus:ring-2 focus:ring-slate-600"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            disabled={busy}
            className="w-full rounded-xl bg-slate-100 text-slate-900 font-medium py-2.5 hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {busy ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-xs text-slate-500 mt-6">
          Autorent • Dashboard administrativo (MVP)
        </p>
      </div>
    </div>
  );
}