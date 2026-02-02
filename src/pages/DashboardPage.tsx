import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { getToken } from "../auth/token";

type Vehicle = {
  _id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  status?: string;
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);

  async function loadVehicles() {
    try {
      setVehiclesError(null);
      setLoadingVehicles(true);

      const token = getToken();
      const res = await fetch("http://localhost:3000/vehicles", {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error("No se pudo cargar vehículos");

      const data = await res.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (e) {
      setVehiclesError("Error cargando vehículos");
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  }

  useEffect(() => {
    loadVehicles();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Autorent Admin</h1>
          <p className="text-sm text-slate-400">Bienvenido, {user?.email}</p>
        </div>

        <button
          onClick={logout}
          className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white transition cursor-pointer"
        >
          Logout
        </button>
      </header>

      {/* Cards resumen */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
        <div
          onClick={() => navigate("/vehicles/new")}
          className="cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/40 p-4 hover:bg-slate-900/60 transition"
        >
          <p className="text-sm text-slate-400">Vehículos</p>
          <p className="mt-2 text-3xl font-semibold">{vehicles.length}</p>
          <p className="text-xs text-slate-500 mt-1">Gestión de flota</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <p className="text-sm text-slate-400">Alquileres</p>
          <p className="mt-2 text-3xl font-semibold">—</p>
          <p className="text-xs text-slate-500 mt-1">Activos y finalizados</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <p className="text-sm text-slate-400">Clientes</p>
          <p className="mt-2 text-3xl font-semibold">—</p>
          <p className="text-xs text-slate-500 mt-1">Registro de usuarios</p>
        </div>
      </section>

      {/* Tabla de vehículos */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium">Vehículos registrados</h2>
            <p className="text-sm text-slate-400">
              Lista completa de carros creados en el sistema.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate("/vehicles/new")}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white transition cursor-pointer"
            >
              + Nuevo
            </button>

            <button
              onClick={loadVehicles}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900/50 transition cursor-pointer"
            >
              Refrescar
            </button>
          </div>
        </div>

        {loadingVehicles && (
          <p className="text-sm text-slate-400">Cargando...</p>
        )}

        {vehiclesError && (
          <p className="text-sm text-red-400">{vehiclesError}</p>
        )}

        {!loadingVehicles && !vehiclesError && vehicles.length === 0 && (
          <p className="text-sm text-slate-400">
            No hay vehículos todavía. Crea el primero con “+ Nuevo”.
          </p>
        )}

        {!loadingVehicles && vehicles.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-300">
                <tr className="border-b border-slate-800">
                  <th className="text-left py-3">Placa</th>
                  <th className="text-left py-3">Marca</th>
                  <th className="text-left py-3">Modelo</th>
                  <th className="text-left py-3">Año</th>
                  <th className="text-left py-3">Estado</th>
                  <th className="text-right py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr
                    key={v._id}
                    className="border-b border-slate-900/60 hover:bg-slate-900/30 transition"
                  >
                    <td className="py-3 font-medium">{v.plate}</td>
                    <td className="py-3">{v.brand}</td>
                    <td className="py-3">{v.model}</td>
                    <td className="py-3">{v.year}</td>
                    <td className="py-3">{v.status ?? "—"}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => navigate(`/vehicles/${v._id}/edit`)}
                        className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:bg-slate-900/60 transition cursor-pointer"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
