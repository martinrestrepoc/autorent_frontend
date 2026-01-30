import { useAuth } from "../auth/useAuth";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Autorent Admin</h1>
          <p className="text-sm text-slate-400">
            Bienvenido, {user?.email}
          </p>
        </div>

        <button
          onClick={logout}
          className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white transition"
        >
          Logout
        </button>
      </header>

      {/* Cards resumen */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <p className="text-sm text-slate-400">Vehículos</p>
          <p className="mt-2 text-3xl font-semibold">—</p>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de flota
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <p className="text-sm text-slate-400">Alquileres</p>
          <p className="mt-2 text-3xl font-semibold">—</p>
          <p className="text-xs text-slate-500 mt-1">
            Activos y finalizados
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <p className="text-sm text-slate-400">Clientes</p>
          <p className="mt-2 text-3xl font-semibold">—</p>
          <p className="text-xs text-slate-500 mt-1">
            Registro de usuarios
          </p>
        </div>
      </section>

      {/* Zona futura */}
      <section className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 p-6">
        <h2 className="text-lg font-medium mb-2">Próximamente</h2>
        <p className="text-sm text-slate-400">
          Aquí se mostrarán acciones rápidas, tablas y estadísticas del sistema
          de alquiler de vehículos.
        </p>
      </section>
    </div>
  );
}