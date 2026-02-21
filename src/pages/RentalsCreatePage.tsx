import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../auth/token";

type Client = {
  _id: string;
  email: string;
  fullName: string;
};

type Vehicle = {
  _id: string;
  plate: string;
  brand: string;
  status?: string;
};

export default function RentalsCreatePage() {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [cliente, setCliente] = useState("");
  const [vehiculo, setVehiculo] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadInitialData() {
    const token = getToken();

    const [clientsRes, vehiclesRes] = await Promise.all([
      fetch("http://localhost:3000/clients", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("http://localhost:3000/vehicles", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    const vehiclesData = await vehiclesRes.json();
    setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);

    const clientsData = await clientsRes.json();
    setClients(
        Array.isArray(clientsData.clients)
        ? clientsData.clients
        : []
    );

  }

  useEffect(() => {
    loadInitialData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!cliente || !vehiculo || !fechaInicio || !fechaFin) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (fechaFin <= fechaInicio) {
      setError("La fecha fin debe ser mayor a la fecha inicio");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const token = getToken();

      const res = await fetch("http://localhost:3000/alquileres", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cliente,
          vehiculo,
          fechaInicio,
          fechaFin,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error creando alquiler");
      }

      navigate("/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-3xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/20 p-6">
        <h2 className="text-lg font-medium mb-6">Crear nuevo alquiler</h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm mb-1 text-slate-400">
              Cliente
            </label>
            <select
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2 text-sm"
            >
              <option value="">Seleccionar cliente</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.fullName} - {c.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-400">
              Vehículo
            </label>
            <select
              value={vehiculo}
              onChange={(e) => setVehiculo(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2 text-sm"
            >
              <option value="">Seleccionar vehículo</option>
              {vehicles
                .filter((v) => v.status === "AVAILABLE")
                .map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.plate} - {v.brand}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 text-slate-400">
                Fecha inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-slate-400">
                Fecha fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2 text-sm"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-900/60"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white"
            >
              {loading ? "Creando..." : "Crear alquiler"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}