import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../api/http";
import VehicleStatusBadge from "../components/VehicleStatusBadge";

type Vehicle = {
  _id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  status?: string;
};

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-t border-white/10">
      <td className="p-3"><div className="h-3 w-20 rounded bg-white/10" /></td>
      <td className="p-3"><div className="h-3 w-28 rounded bg-white/10" /></td>
      <td className="p-3"><div className="h-3 w-28 rounded bg-white/10" /></td>
      <td className="p-3"><div className="h-3 w-16 rounded bg-white/10" /></td>
      <td className="p-3"><div className="h-6 w-24 rounded-full bg-white/10" /></td>
      <td className="p-3"><div className="ml-auto h-8 w-40 rounded bg-white/10" /></td>
    </tr>
  );
}

export default function VehiclesPage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const loadVehicles = async () => {
    try {
      setError("");
      setLoading(true);
      const { data } = await http.get("/vehicles");
      const list = Array.isArray(data) ? data : data?.vehicles ?? [];
      setVehicles(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Error cargando vehiculos");
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadVehicles();
  }, []);

  const deleteVehicle = async (vehicle: Vehicle) => {
    const confirmed = window.confirm(`Seguro que deseas desactivar el vehiculo ${vehicle.plate}?`);
    if (!confirmed) return;

    try {
      await http.delete(`/vehicles/${vehicle._id}`);
      await loadVehicles();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Error desactivando vehiculo");
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter((v) =>
      `${v.plate} ${v.brand} ${v.model} ${v.year} ${v.status ?? ""}`.toLowerCase().includes(q),
    );
  }, [query, vehicles]);

  const available = vehicles.filter((v) => (v.status || "").toUpperCase() === "DISPONIBLE").length;
  const rented = vehicles.filter((v) => (v.status || "").toUpperCase() === "ALQUILADO").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Vehiculos</h1>
          <p className="mt-1 text-sm text-slate-400">
            Flota disponible para la gestion basica de rentas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate("/vehicles/new")}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-90"
          >
            Nuevo vehiculo
          </button>
          <button
            onClick={loadVehicles}
            className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Refrescar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-400">Total vehiculos</p>
          <p className="mt-2 text-2xl font-semibold text-white">{vehicles.length}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-400">Disponibles</p>
          <p className="mt-2 text-2xl font-semibold text-white">{available}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-400">Alquilados</p>
          <p className="mt-2 text-2xl font-semibold text-white">{rented}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="rounded-lg border border-white/10 bg-white/5">
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-300">{filtered.length} vehiculos mostrados</p>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por placa, marca, modelo o estado"
            className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-white/25 md:w-96"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full text-sm">
            <thead className="bg-black/20 text-slate-300">
              <tr>
                <th className="p-3 text-left font-medium">Placa</th>
                <th className="p-3 text-left font-medium">Marca</th>
                <th className="p-3 text-left font-medium">Modelo</th>
                <th className="p-3 text-left font-medium">Anio</th>
                <th className="p-3 text-left font-medium">Estado</th>
                <th className="p-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-slate-200">
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="p-6 text-slate-400" colSpan={6}>
                    {vehicles.length === 0 ? "No hay vehiculos registrados." : "No hay resultados con ese filtro."}
                  </td>
                </tr>
              ) : (
                filtered.map((vehicle) => (
                  <tr key={vehicle._id} className="border-t border-white/10 transition hover:bg-white/5">
                    <td className="p-3 font-semibold text-white">{vehicle.plate}</td>
                    <td className="p-3">{vehicle.brand}</td>
                    <td className="p-3">{vehicle.model}</td>
                    <td className="p-3">{vehicle.year}</td>
                    <td className="p-3"><VehicleStatusBadge status={vehicle.status} /></td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/vehicles/${vehicle._id}/edit`)}
                          className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => navigate(`/vehicles/${vehicle._id}/rentals`)}
                          className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10"
                        >
                          Historial
                        </button>
                        <button
                          onClick={() => void deleteVehicle(vehicle)}
                          className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200 transition hover:bg-red-500/15"
                        >
                          Desactivar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
