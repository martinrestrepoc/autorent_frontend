import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../api/http";

type Rental = {
  _id: string;
  cliente?: {
    _id: string;
    fullName?: string;
    email?: string;
    documentNumber?: string;
  };
  vehiculo?: {
    _id: string;
    plate?: string;
    brand?: string;
    model?: string;
  };
  fechaInicio: string;
  fechaFin: string;
  estado: string;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function StatusPill({ status }: { status?: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-200 ring-1 ring-emerald-500/25">
      {status || "ACTIVO"}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-t border-white/10">
      <td className="p-3"><div className="h-3 w-24 rounded bg-white/10" /></td>
      <td className="p-3"><div className="h-3 w-40 rounded bg-white/10" /></td>
      <td className="p-3"><div className="h-3 w-28 rounded bg-white/10" /></td>
      <td className="p-3"><div className="h-3 w-28 rounded bg-white/10" /></td>
      <td className="p-3"><div className="h-6 w-20 rounded-full bg-white/10" /></td>
    </tr>
  );
}

export default function RentalsPage() {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const loadRentals = async () => {
    try {
      setError("");
      setLoading(true);
      const { data } = await http.get("/alquileres");
      const list = Array.isArray(data) ? data : data?.alquileres ?? data?.rentals ?? [];
      setRentals(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Error cargando alquileres");
      setRentals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRentals();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rentals;
    return rentals.filter((r) => {
      const haystack = [
        r.vehiculo?.plate,
        r.vehiculo?.brand,
        r.vehiculo?.model,
        r.cliente?.fullName,
        r.cliente?.email,
        r.cliente?.documentNumber,
        r.estado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, rentals]);

  const activeCount = rentals.filter((r) => (r.estado || "").toUpperCase() === "ACTIVO").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Alquileres</h1>
          <p className="mt-1 text-sm text-slate-400">
            Gestion basica de rentas conectando clientes y vehiculos.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate("/rentals/new")}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-90"
          >
            Nuevo alquiler
          </button>
          <button
            onClick={loadRentals}
            className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Refrescar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-400">Total rentas</p>
          <p className="mt-2 text-2xl font-semibold text-white">{rentals.length}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-400">Activas</p>
          <p className="mt-2 text-2xl font-semibold text-white">{activeCount}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-400">Mostradas</p>
          <p className="mt-2 text-2xl font-semibold text-white">{filtered.length}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="rounded-lg border border-white/10 bg-white/5">
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-300">Listado de contratos registrados</p>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por placa, cliente o estado"
            className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-white/25 md:w-80"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-sm">
            <thead className="bg-black/20 text-slate-300">
              <tr>
                <th className="p-3 text-left font-medium">Vehiculo</th>
                <th className="p-3 text-left font-medium">Cliente</th>
                <th className="p-3 text-left font-medium">Inicio</th>
                <th className="p-3 text-left font-medium">Fin</th>
                <th className="p-3 text-left font-medium">Estado</th>
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
                      ? "No hay alquileres registrados. Crea el primero para probar el flujo monolitico."
                      : "No hay resultados con ese filtro."}
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id} className="border-t border-white/10 transition hover:bg-white/5">
                    <td className="p-3 font-semibold text-white">
                      {r.vehiculo?.plate || "-"}
                      <span className="block text-xs font-normal text-slate-400">
                        {[r.vehiculo?.brand, r.vehiculo?.model].filter(Boolean).join(" ") || "Vehiculo"}
                      </span>
                    </td>
                    <td className="p-3">
                      {r.cliente?.fullName || r.cliente?.email || "-"}
                      {r.cliente?.documentNumber && (
                        <span className="block text-xs text-slate-400">{r.cliente.documentNumber}</span>
                      )}
                    </td>
                    <td className="p-3">{formatDate(r.fechaInicio)}</td>
                    <td className="p-3">{formatDate(r.fechaFin)}</td>
                    <td className="p-3"><StatusPill status={r.estado} /></td>
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
