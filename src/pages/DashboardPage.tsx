import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { getToken } from "../auth/token";
import ClientsPage from "./ClientsPage";
import RentalsPage from "./RentalsPage";

type Vehicle = {
  _id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  status?: string;
};

type DashboardSection = "home" | "vehicles" | "rentals" | "clients";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<DashboardSection>("home");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [hasLoadedVehicles, setHasLoadedVehicles] = useState(false);
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
      setHasLoadedVehicles(true);
    } catch (e) {
      setVehiclesError("Error cargando vehículos: " + (e as Error).message);
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  }

  useEffect(() => {
    if (activeSection === "vehicles" && !hasLoadedVehicles) {
      loadVehicles();
    }
  }, [activeSection, hasLoadedVehicles]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Autorent Admin</h1>
          <p className="text-sm text-slate-400">Bienvenido, {user?.email}</p>
        </div>

        <div className="flex items-center gap-2">
          {activeSection !== "home" && (
            <button
              onClick={() => setActiveSection("home")}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900/60 transition cursor-pointer"
            >
              Inicio
            </button>
          )}

          <button
            onClick={logout}
            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {activeSection === "home" && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6">
          <h2 className="text-lg font-medium">¿Qué deseas gestionar hoy?</h2>
          <p className="mt-1 text-sm text-slate-400">
            Elige una sección para continuar.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <button
              onClick={() => setActiveSection("vehicles")}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-left hover:bg-slate-900/60 transition cursor-pointer"
            >
              <p className="text-sm text-slate-400">Vehículos</p>
              <p className="mt-2 text-xl font-semibold">Gestión de flota</p>
              <p className="text-xs text-slate-500 mt-1">
                Crear, editar y consultar carros.
              </p>
            </button>

            <button
              onClick={() => setActiveSection("rentals")}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-left hover:bg-slate-900/60 transition cursor-pointer"
            >
              <p className="text-sm text-slate-400">Alquileres</p>
              <p className="mt-2 text-xl font-semibold">Operación diaria</p>
              <p className="text-xs text-slate-500 mt-1">
                Ver contratos activos y cerrados.
              </p>
            </button>

            <button
              onClick={() => setActiveSection("clients")}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-left hover:bg-slate-900/60 transition cursor-pointer"
            >
              <p className="text-sm text-slate-400">Clientes</p>
              <p className="mt-2 text-xl font-semibold">Base de clientes</p>
              <p className="text-xs text-slate-500 mt-1">
                Consultar información de usuarios.
              </p>
            </button>
          </div>
        </section>
      )}

      {activeSection === "vehicles" && (
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
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/vehicles/${v._id}/documents`)}
                            className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:bg-slate-900/60 transition cursor-pointer"
                          >
                            Documentos
                          </button>

                        <button
                          onClick={() => navigate(`/vehicles/${v._id}/edit`)}
                          className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:bg-slate-900/60 transition cursor-pointer"
                        >
                          Update
                        </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
      
      {activeSection === "rentals" && <RentalsPage />}

      {activeSection === "clients" && <ClientsPage />}

    </div>
  );
}
