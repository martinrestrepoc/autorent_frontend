import { useEffect, useState } from "react";
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

export default function RentalsPage() {
  const navigate = useNavigate();

  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadRentals() {
    try {
      setError(null);
      setLoading(true);

      const token = getToken();

      const res = await fetch("http://localhost:3000/alquileres", {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error("No se pudo cargar alquileres");

      const data = await res.json();
      setRentals(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Error cargando alquileres: " + (e as Error).message);
      setRentals([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRentals();
  }, []);

  function formatDate(dateString: string) {
  const [year, month, day] = dateString.split("T")[0].split("-");
  return `${day}/${month}/${year.slice(-2)}`;
    }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium">Alquileres</h2>
            <p className="text-sm text-slate-400">
              Contratos activos y registrados en el sistema.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate("/rentals/new")}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white transition cursor-pointer"
            >
              + Nuevo
            </button>

            <button
              onClick={loadRentals}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900/50 transition cursor-pointer"
            >
              Refrescar
            </button>
          </div>
        </div>

        {loading && (
          <p className="text-sm text-slate-400">Cargando...</p>
        )}

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        {!loading && rentals.length === 0 && (
          <p className="text-sm text-slate-400">
            No hay alquileres registrados todavía.
          </p>
        )}

        {!loading && rentals.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-300">
                <tr className="border-b border-slate-800">
                  <th className="text-left py-3">Vehículo</th>
                  <th className="text-left py-3">Cliente</th>
                  <th className="text-left py-3">Inicio</th>
                  <th className="text-left py-3">Fin</th>
                  <th className="text-left py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {rentals.map((r) => (
                  <tr
                    key={r._id}
                    className="border-b border-slate-900/60 hover:bg-slate-900/30 transition"
                  >
                    <td className="py-3 font-medium">
                      {r.vehiculo?.plate ?? "—"}
                    </td>
                    <td className="py-3">
                      {r.cliente?.email ?? "—"}
                    </td>
                    <td className="py-3">
                        {formatDate(r.fechaInicio)}
                    </td>
                    <td className="py-3">
                        {formatDate(r.fechaFin)}
                    </td>
                    <td className="py-3">{r.estado}</td>
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