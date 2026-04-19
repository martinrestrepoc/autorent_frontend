import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../api/http";
import { useTopbarAction } from "../layout/useTopbarAction";

type Client = {
  _id: string;
  email?: string;
  fullName?: string;
  documentNumber?: string;
};

type Vehicle = {
  _id: string;
  plate: string;
  brand: string;
  model?: string;
  status?: string;
};

function normalizeList<T>(data: unknown, key: string): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as Record<string, unknown>)[key])) {
    return (data as Record<string, unknown>)[key] as T[];
  }
  return [];
}

export default function RentalsCreatePage() {
  const navigate = useNavigate();
  useTopbarAction({ label: "Volver", to: "/rentals" });

  const today = new Date().toISOString().slice(0, 10);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [cliente, setCliente] = useState("");
  const [vehiculo, setVehiculo] = useState("");
  const [fechaInicio, setFechaInicio] = useState(today);
  const [fechaFin, setFechaFin] = useState("");
  const [loadingInit, setLoadingInit] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const inputBase =
    "mt-1 w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-white/25";

  const availableVehicles = useMemo(
    () => vehicles.filter((v) => (v.status || "DISPONIBLE").toUpperCase() === "DISPONIBLE"),
    [vehicles],
  );

  const selectedClient = clients.find((c) => c._id === cliente);
  const selectedVehicle = vehicles.find((v) => v._id === vehiculo);

  const loadInitialData = async () => {
    try {
      setError("");
      setLoadingInit(true);
      const [clientsResponse, vehiclesResponse] = await Promise.all([
        http.get("/clients"),
        http.get("/vehicles"),
      ]);

      setClients(normalizeList<Client>(clientsResponse.data, "clients"));
      setVehicles(normalizeList<Vehicle>(vehiclesResponse.data, "vehicles"));
    } catch (e: any) {
      setError(e?.response?.data?.message || "No se pudieron cargar clientes y vehiculos");
      setClients([]);
      setVehicles([]);
    } finally {
      setLoadingInit(false);
    }
  };

  useEffect(() => {
    void loadInitialData();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!cliente || !vehiculo || !fechaInicio || !fechaFin) {
      setError("Completa cliente, vehiculo, fecha inicio y fecha fin");
      return;
    }

    if (fechaFin <= fechaInicio) {
      setError("La fecha fin debe ser mayor a la fecha inicio");
      return;
    }

    try {
      setSaving(true);
      await http.post("/alquileres", {
        cliente,
        vehiculo,
        fechaInicio,
        fechaFin,
      });
      navigate("/rentals");
    } catch (e: any) {
      const message = e?.response?.data?.message;
      setError(Array.isArray(message) ? message[0] : message || "No se pudo crear el alquiler");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Nuevo alquiler</h1>
        <p className="mt-1 text-sm text-slate-400">
          Selecciona un cliente, un vehiculo disponible y el rango de fechas.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form onSubmit={handleSubmit} className="rounded-lg border border-white/10 bg-white/5 p-5">
          {loadingInit ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-10 rounded bg-white/10" />
              <div className="h-10 rounded bg-white/10" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="h-10 rounded bg-white/10" />
                <div className="h-10 rounded bg-white/10" />
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-xs text-slate-300">Cliente</label>
                <select value={cliente} onChange={(e) => setCliente(e.target.value)} className={inputBase}>
                  <option value="">Seleccionar cliente</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.fullName || c.email || c.documentNumber || c._id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300">Vehiculo disponible</label>
                <select value={vehiculo} onChange={(e) => setVehiculo(e.target.value)} className={inputBase}>
                  <option value="">Seleccionar vehiculo</option>
                  {availableVehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.plate} - {v.brand} {v.model || ""}
                    </option>
                  ))}
                </select>
                {availableVehicles.length === 0 && (
                  <p className="mt-2 text-xs text-amber-200">No hay vehiculos disponibles para rentar.</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs text-slate-300">Fecha inicio</label>
                  <input
                    type="date"
                    value={fechaInicio}
                    min={today}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300">Fecha fin</label>
                  <input
                    type="date"
                    value={fechaFin}
                    min={fechaInicio || today}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className={inputBase}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving || availableVehicles.length === 0}
                  className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? "Creando..." : "Crear alquiler"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/rentals")}
                  className="rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </form>

        <aside className="rounded-lg border border-white/10 bg-white/5 p-5">
          <h2 className="text-sm font-semibold text-white">Resumen</h2>
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <p className="text-xs text-slate-400">Cliente</p>
              <p className="mt-1 text-slate-200">{selectedClient?.fullName || selectedClient?.email || "Sin seleccionar"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Vehiculo</p>
              <p className="mt-1 text-slate-200">{selectedVehicle ? `${selectedVehicle.plate} - ${selectedVehicle.brand}` : "Sin seleccionar"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Periodo</p>
              <p className="mt-1 text-slate-200">{fechaInicio && fechaFin ? `${fechaInicio} a ${fechaFin}` : "Sin definir"}</p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
