import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import {
  TopbarActionContext,
  type TopbarAction,
} from "./topbarAction.context";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [topbarAction, setTopbarAction] = useState<TopbarAction>(null);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cx(
      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
      isActive
        ? "bg-white/10 text-white ring-1 ring-white/15"
        : "text-slate-300 hover:bg-white/5 hover:text-white",
    );

  const topbarContextValue = useMemo(
    () => ({ action: topbarAction, setAction: setTopbarAction }),
    [topbarAction],
  );

  const handleLogout = () => {
    logout?.();
    navigate("/login", { replace: true });
  };

  const handleTopbarAction = () => {
    if (!topbarAction) return;
    if (topbarAction.onClick) topbarAction.onClick();
    if (topbarAction.to) navigate(topbarAction.to);
  };

  return (
    <TopbarActionContext.Provider value={topbarContextValue}>
      <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl">
          <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-slate-950 p-5 md:block">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 ring-1 ring-white/15">
                <span className="font-bold">AR</span>
              </div>
              <div>
                <p className="text-sm text-slate-300">Panel</p>
                <h1 className="text-lg font-semibold tracking-tight">Autorent</h1>
              </div>
            </div>

            <nav className="mt-8 space-y-1">
              <NavLink to="/" className={linkClass} end>
                <span className="h-2 w-2 rounded-full bg-blue-400/80 opacity-0 transition group-hover:opacity-100" />
                Dashboard
              </NavLink>
              <NavLink to="/vehicles" className={linkClass}>
                <span className="h-2 w-2 rounded-full bg-blue-400/80 opacity-0 transition group-hover:opacity-100" />
                Vehiculos
              </NavLink>
              <NavLink to="/clients" className={linkClass}>
                <span className="h-2 w-2 rounded-full bg-blue-400/80 opacity-0 transition group-hover:opacity-100" />
                Clientes
              </NavLink>
              <NavLink to="/rentals" className={linkClass}>
                <span className="h-2 w-2 rounded-full bg-blue-400/80 opacity-0 transition group-hover:opacity-100" />
                Alquileres
              </NavLink>
            </nav>

            <div className="mt-10 rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">Sesion activa</p>
              <p className="mt-1 truncate text-sm font-medium">
                {user?.email || "admin"}
              </p>
              <button
                onClick={handleLogout}
                className="mt-4 w-full rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white ring-1 ring-white/15 transition hover:bg-white/15"
              >
                Cerrar sesion
              </button>
            </div>
          </aside>

          <main className="flex-1">
            <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur">
              <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
                <div>
                  <p className="text-xs text-slate-400">Bienvenido</p>
                  <h2 className="text-base font-semibold tracking-tight">
                    {user?.email || "admin@autorent.local"}
                  </h2>
                </div>

                {topbarAction && location.pathname !== "/" && (
                  <button
                    onClick={handleTopbarAction}
                    className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    {topbarAction.label}
                  </button>
                )}
              </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </TopbarActionContext.Provider>
  );
}
