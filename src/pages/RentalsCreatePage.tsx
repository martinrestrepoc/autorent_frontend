import React, { useEffect, useState } from "react";
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

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

function normalizeMessage(msg: any): string[] {
  if (Array.isArray(msg)) return msg.map(String);
  if (typeof msg === "string") return [msg];
  return ["Error inesperado"];
}

export default function RentalsCreatePage() {
  const navigate = useNavigate();
  const todayString = new Date().toISOString().slice(0, 10);

  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [cliente, setCliente] = useState("");
  const [vehiculo, setVehiculo] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [loadingInit, setLoadingInit] = useState(true);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const inputBase =
    "mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-white/25";

  async function fetchJSON(path: string) {
    const token = getToken();
    const res = await fetch(`${API_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = normalizeMessage(data?.message)[0] ?? `Error ${res.status} en ${path}`;
      throw new Error(msg);
    }
    return data;
  }

  async function loadInitialData() {
    setError(null);
    setLoadingInit(true);

    try {
      const [clientsData, vehiclesData] = await Promise.all([
        fetchJSON("/clients"),
        fetchJSON("/vehicles"),
      ]);

      // clients: puede venir { clients: [] }
      setClients(Array.isArray(clientsData?.clients) ? clientsData.clients : []);

      // vehicles: puede venir array directo o { vehicles: [] }
      const vList = Array.isArray(vehiclesData) ? vehiclesData : (vehiclesData?.vehicles ?? []);
      setVehicles(Array.isArray(vList) ? vList : []);
    } catch (e) {
      setError((e as Error).message);
      setClients([]);
      setVehicles([]);
    } finally {
      setLoadingInit(false);
    }
  }

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!cliente || !vehiculo || !fechaInicio || !fechaFin) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (fechaFin <= fechaInicio) {
      setError("La fecha fin debe ser mayor a la fecha inicio");
      return;
    }

    if (fechaInicio < todayString) {
      setError("La fecha inicio no puede ser anterior a hoy");
      return;
    }

    try {
      setLoading(true);

      const token = getToken();
      const res = await fetch(`${API_URL}/alquileres`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ cliente, vehiculo, fechaInicio, fechaFin }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = normalizeMessage(data?.message)[0] ?? "Error creando alquiler";
        throw new Error(msg);
      }

      setSuccessMsg(data?.message ?? "Alquiler creado con éxito");
      // manda a la lista
      navigate("/rentals");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Crear nuevo alquiler
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Selecciona cliente, vehículo y rango de fechas para programar el contrato.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/rentals")}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Volver a alquileres
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          {successMsg}
        </div>
      )}

      {/* Card */}
      <section className="max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6">
        {loadingInit ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-full rounded-xl bg-white/10" />
            <div className="h-10 w-full rounded-xl bg-white/10" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="h-10 w-full rounded-xl bg-white/10" />
              <div className="h-10 w-full rounded-xl bg-white/10" />
            </div>
            <div className="h-11 w-44 rounded-xl bg-white/10" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-slate-300">Cliente</label>
              <select
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className={inputBase}
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
              <label className="block text-xs text-slate-300">Vehículo</label>
              <select
                value={vehiculo}
                onChange={(e) => setVehiculo(e.target.value)}
                className={inputBase}
              >
                <option value="">Seleccionar vehículo</option>

                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.plate} - {v.brand}
                    {v.status ? ` (${v.status})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs text-slate-300">Fecha inicio</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  min={todayString}
                  className={inputBase}
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300">Fecha fin</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  min={fechaInicio || todayString}
                  className={inputBase}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Creando..." : "Crear alquiler"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/rentals")}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
