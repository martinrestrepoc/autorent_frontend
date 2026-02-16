import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../api/http";

export default function ClientsCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    documentType: "CC",
    documentNumber: "",
    phone: "",
    email: "",
  });
  const [error, setError] = useState("");

  const onChange = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await http.post("/clients", form);
      navigate("/clients");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Error creando cliente");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-slate-100">Nuevo cliente</h1>
        <p className="text-sm text-slate-400">Registra un cliente para alquilar vehículos.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-900/40 bg-red-900/20 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="max-w-xl rounded-2xl border border-slate-800 bg-slate-900/20 p-5 space-y-3">
        <div>
          <label className="text-xs text-slate-300">Nombre completo</label>
          <input className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/40 p-2 text-slate-100"
            value={form.fullName} onChange={(e) => onChange("fullName", e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-300">Tipo documento</label>
            <select className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/40 p-2 text-slate-100"
              value={form.documentType} onChange={(e) => onChange("documentType", e.target.value)} required>
              <option value="CC">CC</option>
              <option value="CE">CE</option>
              <option value="PAS">PAS</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-300">Número documento</label>
            <input className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/40 p-2 text-slate-100"
              value={form.documentNumber} onChange={(e) => onChange("documentNumber", e.target.value)} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-300">Teléfono</label>
            <input className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/40 p-2 text-slate-100"
              value={form.phone} onChange={(e) => onChange("phone", e.target.value)} required />
          </div>

          <div>
            <label className="text-xs text-slate-300">Email</label>
            <input type="email" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/40 p-2 text-slate-100"
              value={form.email} onChange={(e) => onChange("email", e.target.value)} required />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900">
            Guardar
          </button>
          <button type="button" onClick={() => navigate("/clients")}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
