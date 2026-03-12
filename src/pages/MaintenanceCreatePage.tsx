import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { http } from "../api/http";

type MaintenanceType = "preventivo" | "correctivo";

type FormState = {
  tipo: MaintenanceType;
  descripcion: string;
  fecha: string;
  costo: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

export default function MaintenanceCreatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    tipo: "preventivo",
    descripcion: "",
    fecha: "",
    costo: "",
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormError(null);
    setSuccessMsg(null);
  }

  function validate(): boolean {
    const errs: FieldErrors = {};

    if (!form.tipo) errs.tipo = "El tipo es obligatorio";
    if (!form.descripcion.trim())
      errs.descripcion = "La descripción es obligatoria";
    if (!form.fecha) errs.fecha = "La fecha es obligatoria";
    if (form.costo !== "" && isNaN(Number(form.costo)))
      errs.costo = "El costo debe ser un número";
    if (form.costo !== "" && Number(form.costo) < 0)
      errs.costo = "El costo no puede ser negativo";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    if (!validate()) return;

    try {
      setLoading(true);

      const payload = {
        tipo: form.tipo,
        descripcion: form.descripcion.trim(),
        fecha: form.fecha,
        ...(form.costo !== "" ? { costo: Number(form.costo) } : {}),
      };

      const { data } = await http.post(
        `/vehiculos/${id}/mantenimientos`,
        payload
      );

      setSuccessMsg(data?.message ?? "Mantenimiento registrado con éxito");
      setForm({ tipo: "preventivo", descripcion: "", fecha: "", costo: "" });
      setErrors({});
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ?? "No se pudo conectar con el servidor.";
      setFormError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-white/25";

  const errorClass = "mt-1 text-xs text-red-300";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Registrar mantenimiento
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Asocia un mantenimiento preventivo o correctivo al vehículo.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate(`/vehicles/${id}/maintenances`)}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Ver historial
          </button>
          <button
            type="button"
            onClick={() => navigate("/vehicles")}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Volver a vehículos
          </button>
        </div>
      </div>

      {/* Alerts */}
      {formError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {formError}
        </div>
      )}

      {successMsg && (
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          {successMsg}
        </div>
      )}

      {/* Form */}
      <section className="max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tipo */}
          <div>
            <label className="text-sm font-medium text-slate-300">
              Tipo <span className="text-red-400">*</span>
            </label>
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className={inputBase}
            >
              <option value="preventivo">Preventivo</option>
              <option value="correctivo">Correctivo</option>
            </select>
            {errors.tipo && <p className={errorClass}>{errors.tipo}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label className="text-sm font-medium text-slate-300">
              Descripción <span className="text-red-400">*</span>
            </label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={3}
              placeholder="Ej: Cambio de aceite y filtro"
              className={`${inputBase} resize-none`}
            />
            {errors.descripcion && (
              <p className={errorClass}>{errors.descripcion}</p>
            )}
          </div>

          {/* Fecha */}
          <div>
            <label className="text-sm font-medium text-slate-300">
              Fecha <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              name="fecha"
              value={form.fecha}
              onChange={handleChange}
              className={inputBase}
            />
            {errors.fecha && <p className={errorClass}>{errors.fecha}</p>}
          </div>

          {/* Costo */}
          <div>
            <label className="text-sm font-medium text-slate-300">
              Costo (opcional)
            </label>
            <input
              type="number"
              name="costo"
              value={form.costo}
              onChange={handleChange}
              min={0}
              step="0.01"
              placeholder="0"
              className={inputBase}
            />
            {errors.costo && <p className={errorClass}>{errors.costo}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Guardando…" : "Registrar mantenimiento"}
          </button>
        </form>
      </section>
    </div>
  );
}
