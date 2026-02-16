import { useEffect, useState } from "react";
import { http } from "../api/http";

type Client = {
  _id: string;
  fullName: string;
  documentType: string;
  documentNumber: string;
  phone: string;
  email: string;
  status?: string;
};

type Mode = "list" | "create" | "edit";

const emptyForm = {
  fullName: "",
  documentType: "CC",
  documentNumber: "",
  phone: "",
  email: "",
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [mode, setMode] = useState<Mode>("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [form, setForm] = useState({ ...emptyForm });

  const onChange = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const loadClients = async () => {
    try {
      setError("");
      setLoading(true);
      const { data } = await http.get("/clients");
      setClients(data.clients ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Error cargando clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // ---------- CREATE ----------
  const startCreate = () => {
    setForm({ ...emptyForm });
    setSelectedId(null);
    setError("");
    setMode("create");
  };

  const create = async () => {
    try {
      setError("");
      await http.post("/clients", form);
      await loadClients();
      setMode("list");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Error creando cliente");
    }
  };

  // ---------- EDIT ----------
  const startEdit = async (id: string) => {
    try {
      setError("");
      setLoading(true);
      const { data } = await http.get(`/clients/${id}`);
      const c: Client = data.client;

      setForm({
        fullName: c.fullName ?? "",
        documentType: c.documentType ?? "CC",
        documentNumber: c.documentNumber ?? "",
        phone: c.phone ?? "",
        email: c.email ?? "",
      });

      setSelectedId(id);
      setMode("edit");
    } catch (e: any) {
      setError(e?.response?.data?.message || "No se pudo cargar el cliente");
    } finally {
      setLoading(false);
    }
  };

  const update = async () => {
    if (!selectedId) return;

    try {
      setError("");
      await http.patch(`/clients/${selectedId}`, form);
      await loadClients();
      setMode("list");
      setSelectedId(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Error actualizando cliente");
    }
  };

  // ---------- DELETE ----------
  const remove = async (id: string) => {
    const ok = confirm("¿Eliminar cliente permanentemente?");
    if (!ok) return;

    try {
      setError("");
      await http.delete(`/clients/${id}`);
      await loadClients();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Error eliminando cliente");
    }
  };

  const cancelForm = () => {
    setMode("list");
    setSelectedId(null);
    setForm({ ...emptyForm });
    setError("");
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-medium">Clientes</h2>
          <p className="mt-1 text-sm text-slate-400">
            Registra, edita y elimina clientes.
          </p>
        </div>

        {mode === "list" ? (
          <div className="flex gap-2">
            <button
              onClick={startCreate}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900"
            >
              + Nuevo
            </button>
            <button
              onClick={loadClients}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200"
            >
              Refrescar
            </button>
          </div>
        ) : (
          <button
            onClick={cancelForm}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200"
          >
            Volver
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-900/40 bg-red-900/20 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* LIST */}
      {mode === "list" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/40 text-slate-300">
              <tr>
                <th className="text-left p-3">Nombre</th>
                <th className="text-left p-3">Documento</th>
                <th className="text-left p-3">Teléfono</th>
                <th className="text-left p-3">Email</th>
                <th className="text-right p-3">Acciones</th>
              </tr>
            </thead>

            <tbody className="text-slate-200">
              {loading ? (
                <tr>
                  <td className="p-3" colSpan={5}>
                    Cargando...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td className="p-3" colSpan={5}>
                    No hay clientes.
                  </td>
                </tr>
              ) : (
                clients.map((c) => (
                  <tr key={c._id} className="border-t border-slate-800">
                    <td className="p-3">{c.fullName}</td>
                    <td className="p-3">
                      {c.documentType} {c.documentNumber}
                    </td>
                    <td className="p-3">{c.phone}</td>
                    <td className="p-3">{c.email}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => startEdit(c._id)}
                        className="mr-2 rounded-lg border border-slate-700 px-3 py-1 text-xs"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => remove(c._id)}
                        className="rounded-lg border border-red-700/60 px-3 py-1 text-xs text-red-200"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* FORM (CREATE/EDIT) */}
      {(mode === "create" || mode === "edit") && (
        <div className="max-w-xl rounded-2xl border border-slate-800 bg-slate-900/10 p-5 space-y-3">
          <div className="text-sm text-slate-300">
            {mode === "create" ? "Crear cliente" : "Editar cliente"}
          </div>

          <div>
            <label className="text-xs text-slate-300">Nombre completo</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/40 p-2 text-slate-100"
              value={form.fullName}
              onChange={(e) => onChange("fullName", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300">Tipo documento</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/40 p-2 text-slate-100"
                value={form.documentType}
                onChange={(e) => onChange("documentType", e.target.value)}
                required
              >
                <option value="CC">CC</option>
                <option value="CE">CE</option>
                <option value="PAS">PAS</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300">Número documento</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/40 p-2 text-slate-100"
                value={form.documentNumber}
                onChange={(e) => onChange("documentNumber", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300">Teléfono</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/40 p-2 text-slate-100"
                value={form.phone}
                onChange={(e) => onChange("phone", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-300">Email</label>
              <input
                type="email"
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/40 p-2 text-slate-100"
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {mode === "create" ? (
              <button
                onClick={create}
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900"
              >
                Guardar
              </button>
            ) : (
              <button
                onClick={update}
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900"
              >
                Guardar cambios
              </button>
            )}

            <button
              onClick={cancelForm}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
