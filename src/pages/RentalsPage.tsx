import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../auth/token";

type Rental = {
  _id: string;
  cliente: {
    _id: string;
    email?: string;
  };
  vehiculo: {
    _id: string;
    plate: string;
  };
  fechaInicio: string;
  fechaFin: string;
  estado: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-200 ring-1 ring-white/15">
      {text}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const s = (status ?? "").toLowerCase();
  const ok =
    s.includes("activo") || s.includes("vigente") || s.includes("abierto");
  const done =
    s.includes("cerrado") || s.includes("final") || s.includes("termin");

  const cls = ok
    ? "bg-emerald-500/10 text-emerald-200 ring-emerald-500/25"
    : done
    ? "bg-slate-500/10 text-slate-200 ring-slate-500/20"
    : "bg-amber-500/10 text-amber-200 ring-amber-500/25";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${cls}`}>
      {status || "—"}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-t border-white/10">
      <td className="p-3"><div className="h-3 w-20 rounded bg-white/10" /></td>
      <td className="p-3"><div className="h-3 w-44 rounded bg-white/10" /></td>
      <td className="p-3"><div className="h-3 w-20 rounded bg-white/10" /></td>
      <td className="p-3"><div className="h-3 w-20 rounded bg-white/10" /></td>
      <td className="p-3"><div className="h-6 w-20 rounded-full bg-white/10" /></td>
    </tr>
  );
}

export default function RentalsPage() {
  const navigate = useNavigate();

  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  async function loadRentals() {
    try {
      setError(null);
      setLoading(true);

      const token = getToken();
      const res = await fetch(`${API_URL}/alquileres`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "No se pudo cargar alquileres");

      // soporta array directo o { alquileres: [] } / { rentals: [] }
      const list = Array.isArray(data)
        ? data
        : (data.alquileres ?? data.rentals ?? []);
      setRentals(Array.isArray(list) ? list : []);
    } catch (e) {
      setError("Error cargando alquileres: " + (e as Error).message);
      setRentals([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRentals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function formatDate(dateString: string) {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "2-digit" });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rentals;

    return rentals.filter((r) => {
      const hay = `${r.vehiculo?.plate ?? ""} ${r.cliente?.email ?? ""} ${r.estado ?? ""} ${r.fechaInicio ?? ""} ${r.fechaFin ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rentals, query]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Alquileres
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Contratos activos y registrados en el sistema.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate("/rentals/new")}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-90"
          >
            + Nuevo alquiler
          </button>

          <button
            onClick={loadRentals}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Refrescar
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Table card */}
      <section className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Badge text={`${filtered.length} alquileres`} />
            {query.trim() && <Badge text={`Filtro: "${query.trim()}"`} />}
          </div>

          <div className="w-full md:w-80">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por placa, email o estado..."
              className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-white/25"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-black/20 text-slate-300">
              <tr>
                <th className="text-left p-3 font-medium">Vehículo</th>
                <th className="text-left p-3 font-medium">Cliente</th>
                <th className="text-left p-3 font-medium">Inicio</th>
                <th className="text-left p-3 font-medium">Fin</th>
                <th className="text-left p-3 font-medium">Estado</th>
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
                  <td className="p-6 text-slate-400" colSpan={5}>
                    {rentals.length === 0
                      ? "No hay alquileres registrados todavía. Crea el primero con “+ Nuevo alquiler”."
                      : "No hay resultados con ese filtro."}
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r._id}
                    className="border-t border-white/10 hover:bg-white/5 transition"
                  >
                    <td className="p-3 font-semibold text-white">
                      {r.vehiculo?.plate ?? "—"}
                    </td>
                    <td className="p-3">{r.cliente?.email ?? "—"}</td>
                    <td className="p-3">{formatDate(r.fechaInicio)}</td>
                    <td className="p-3">{formatDate(r.fechaFin)}</td>
                    <td className="p-3">
                      <StatusPill status={r.estado} />
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