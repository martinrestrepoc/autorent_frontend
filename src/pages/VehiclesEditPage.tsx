import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getToken } from "../auth/token";

type FieldErrors = Partial<Record<"plate" | "brand" | "model" | "year", string>>;

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const PLATE_REGEX = /^[A-Z]{3}\d{3,4}$/;

function normalizeMessage(msg: any): string[] {
  if (Array.isArray(msg)) return msg.map(String);
  if (typeof msg === "string") return [msg];
  return ["Error inesperado"];
}

function mapBackendErrorsToFields(messages: string[]): { fieldErrors: FieldErrors; formError?: string } {
  const fieldErrors: FieldErrors = {};
  let formError: string | undefined;

  for (const m of messages) {
    const lower = m.toLowerCase();

    if (lower.includes("placa") || lower.includes("plate")) {
      fieldErrors.plate = m;
      continue;
    }
    if (lower.includes("marca") || lower.includes("brand")) {
      fieldErrors.brand = m;
      continue;
    }
    if (lower.includes("modelo") || lower.includes("model")) {
      fieldErrors.model = m;
      continue;
    }
    if (lower.includes("año") || lower.includes("year")) {
      fieldErrors.year = m;
      continue;
    }

    formError = m;
  }

  return { fieldErrors, formError };
}

export default function VehiclesEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState({
    plate: "",
    brand: "",
    model: "",
    year: "",
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormError(null);
    setSuccessMsg(null);
  }

  function validateLocal(): boolean {
    const next: FieldErrors = {};
    const plate = form.plate.trim().toUpperCase();
    const brand = form.brand.trim();
    const model = form.model.trim();
    const yearStr = form.year.trim();

    if (!plate) next.plate = "Campo obligatorio";
    else if (!PLATE_REGEX.test(plate)) next.plate = "Formato de placa inválido (ej: ABC123)";

    if (!brand) next.brand = "Campo obligatorio";
    if (!model) next.model = "Campo obligatorio";

    if (!yearStr) next.year = "Campo obligatorio";
    else {
      const yearNum = Number(yearStr);
      if (Number.isNaN(yearNum)) next.year = "Año inválido";
      else if (yearNum < 1950 || yearNum > 2100) next.year = "Año fuera de rango (1950 - 2100)";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  useEffect(() => {
    async function load() {
      if (!id) return;

      setLoadingData(true);
      setFormError(null);

      try {
        const token = getToken();
        const res = await fetch(`${API_URL}/vehicles/${id}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const messages = normalizeMessage(data?.message);
          setFormError(messages[0] ?? "No se pudo cargar el vehículo");
          return;
        }

        const v = data?.vehicle ?? data;
        setForm({
          plate: String(v?.plate ?? ""),
          brand: String(v?.brand ?? ""),
          model: String(v?.model ?? ""),
          year: String(v?.year ?? ""),
        });
      } catch {
        setFormError("No se pudo conectar con el servidor.");
      } finally {
        setLoadingData(false);
      }
    }

    load();
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg(null);
    setFormError(null);

    if (!id) {
      setFormError("Falta el ID del vehículo.");
      return;
    }

    if (!validateLocal()) return;

    setLoading(true);
    try {
      const token = getToken();

      const payload = {
        plate: form.plate.trim().toUpperCase(),
        brand: form.brand.trim(),
        model: form.model.trim(),
        year: Number(form.year),
      };

      const res = await fetch(`${API_URL}/vehicles/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const messages = normalizeMessage(data?.message);
        const mapped = mapBackendErrorsToFields(messages);
        setErrors((prev) => ({ ...prev, ...mapped.fieldErrors }));
        setFormError(mapped.formError ?? null);
        return;
      }

      setSuccessMsg(data?.message ?? "Vehículo actualizado con éxito");
    } catch {
      setFormError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Editar vehículo</h1>
          <p className="text-sm text-slate-400">Actualiza placa, marca, modelo y año.</p>
        </div>

        <div className="flex items-center gap-2">
          {id && (
            <button
              type="button"
              onClick={() => navigate(`/vehicles/${id}/documents`)}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900/60 transition cursor-pointer"
            >
              Subir documento
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white transition cursor-pointer"
          >
            Volver
          </button>
        </div>
      </header>

      <section className="max-w-xl rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        {formError && (
          <div className="mb-4 rounded-xl border border-red-900/50 bg-red-950/40 p-3 text-sm text-red-200">
            {formError}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-xl border border-emerald-900/50 bg-emerald-950/40 p-3 text-sm text-emerald-200">
            {successMsg}
          </div>
        )}

        {loadingData ? (
          <p className="text-sm text-slate-400">Cargando vehículo...</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-slate-300">Placa</label>
              <input
                name="plate"
                value={form.plate}
                onChange={onChange}
                placeholder="Ej: ABC123"
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 outline-none focus:border-slate-600"
              />
              {errors.plate && <p className="mt-2 text-xs text-red-300">{errors.plate}</p>}
            </div>

            <div>
              <label className="text-sm text-slate-300">Marca</label>
              <input
                name="brand"
                value={form.brand}
                onChange={onChange}
                placeholder="Ej: Toyota"
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 outline-none focus:border-slate-600"
              />
              {errors.brand && <p className="mt-2 text-xs text-red-300">{errors.brand}</p>}
            </div>

            <div>
              <label className="text-sm text-slate-300">Modelo</label>
              <input
                name="model"
                value={form.model}
                onChange={onChange}
                placeholder="Ej: Corolla"
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 outline-none focus:border-slate-600"
              />
              {errors.model && <p className="mt-2 text-xs text-red-300">{errors.model}</p>}
            </div>

            <div>
              <label className="text-sm text-slate-300">Año</label>
              <input
                name="year"
                value={form.year}
                onChange={onChange}
                placeholder="Ej: 2021"
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 outline-none focus:border-slate-600"
              />
              {errors.year && <p className="mt-2 text-xs text-red-300">{errors.year}</p>}
            </div>

            <button
              disabled={loading}
              className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-white transition disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Actualizando..." : "Actualizar vehículo"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
