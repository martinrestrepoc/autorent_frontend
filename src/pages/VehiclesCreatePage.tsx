import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../auth/token";

type FieldErrors = Partial<Record<"plate" | "brand" | "model" | "year", string>>;

export default function VehiclesCreatePage() {
  const navigate = useNavigate();
  const token = getToken();


  const [form, setForm] = useState({
    plate: "",
    brand: "",
    model: "",
    year: "",
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSuccessMsg(null);
  }

  function validateLocal() {
    const next: FieldErrors = {};
    if (!form.plate.trim()) next.plate = "Campo obligatorio";
    if (!form.brand.trim()) next.brand = "Campo obligatorio";
    if (!form.model.trim()) next.model = "Campo obligatorio";
    if (!form.year.trim()) next.year = "Campo obligatorio";
    else if (Number.isNaN(Number(form.year))) next.year = "Año inválido";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateLocal()) return;

    setLoading(true);
    setSuccessMsg(null);

    try {
      const res = await fetch("http://localhost:3000/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          plate: form.plate,
          brand: form.brand,
          model: form.model,
          year: Number(form.year),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccessMsg("Vehículo creado con éxito ✅");
        setForm({ plate: "", brand: "", model: "", year: "" });
        setErrors({});
        return;
      }

      // Caso: placa repetida
      if (typeof data?.message === "string" && data.message.includes("La placa ya existe")) {
        setErrors((prev) => ({ ...prev, plate: "La placa ya existe" }));
        return;
      }

      // Caso: errores de validación backend (array)
      if (Array.isArray(data?.message)) {
        const arr: string[] = data.message;
        const next: FieldErrors = {};

        if (arr.some((m) => m.toLowerCase().includes("plate") && m.includes("Campo obligatorio")))
          next.plate = "Campo obligatorio";
        if (arr.some((m) => m.toLowerCase().includes("brand") && m.includes("Campo obligatorio")))
          next.brand = "Campo obligatorio";
        if (arr.some((m) => m.toLowerCase().includes("model") && m.includes("Campo obligatorio")))
          next.model = "Campo obligatorio";
        if (arr.some((m) => m.toLowerCase().includes("year") && m.includes("Campo obligatorio")))
          next.year = "Campo obligatorio";

        if (Object.keys(next).length) {
          setErrors((prev) => ({ ...prev, ...next }));
          return;
        }
      }
    } catch {
      // silencio, mostramos abajo
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Registrar vehículo</h1>
          <p className="text-sm text-slate-400">
            Placa, marca, modelo y año son obligatorios.
          </p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white transition"
        >
          Volver
        </button>
      </header>

      <section className="max-w-xl rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
        {successMsg && (
          <div className="mb-4 rounded-xl border border-emerald-700/40 bg-emerald-900/20 p-3 text-emerald-200">
            {successMsg}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Placa"
            name="plate"
            value={form.plate}
            onChange={onChange}
            error={errors.plate}
            placeholder="Ej: ABC123"
          />
          <Input
            label="Marca"
            name="brand"
            value={form.brand}
            onChange={onChange}
            error={errors.brand}
            placeholder="Ej: Toyota"
          />
          <Input
            label="Modelo"
            name="model"
            value={form.model}
            onChange={onChange}
            error={errors.model}
            placeholder="Ej: Corolla"
          />
          <Input
            label="Año"
            name="year"
            value={form.year}
            onChange={onChange}
            error={errors.year}
            placeholder="Ej: 2021"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white transition disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Guardar vehículo"}
          </button>
        </form>
      </section>
    </div>
  );
}

function Input(props: {
  label: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-slate-300">{props.label}</label>
      <input
        name={props.name}
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
        className={`w-full rounded-xl bg-slate-950/60 px-3 py-2 text-slate-100 outline-none border ${
          props.error ? "border-red-500" : "border-slate-800"
        }`}
      />
      {props.error && <p className="mt-1 text-xs text-red-400">{props.error}</p>}
    </div>
  );
}
