import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getToken } from "../auth/token";

type VehicleDocumentType = "SOAT" | "TARJETA_PROPIEDAD" | "TECNOMECANICA";
type DocumentStatus = "VIGENTE" | "VENCIDO";

type VehicleLegalDocument = {
  id: string;
  type: VehicleDocumentType;
  originalName: string;
  mimeType: string;
  size: number;
  expiresAt: string;
  uploadedAt: string;
  status: DocumentStatus;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const DOCUMENT_TYPE_OPTIONS: { value: VehicleDocumentType; label: string }[] = [
  { value: "SOAT", label: "SOAT" },
  { value: "TARJETA_PROPIEDAD", label: "Tarjeta de propiedad" },
  { value: "TECNOMECANICA", label: "Tecnomecánica" },
];

function normalizeMessage(msg: any): string[] {
  if (Array.isArray(msg)) return msg.map(String);
  if (typeof msg === "string") return [msg];
  return ["Error inesperado"];
}

export default function VehiclesDocumentsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [documents, setDocuments] = useState<VehicleLegalDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [documentSuccessMsg, setDocumentSuccessMsg] = useState<string | null>(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [downloadingDocumentId, setDownloadingDocumentId] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [documentForm, setDocumentForm] = useState<{
    type: VehicleDocumentType;
    expiresAt: string;
    file: File | null;
  }>({
    type: "SOAT",
    expiresAt: "",
    file: null,
  });

  useEffect(() => {
    if (!id) return;
    void loadDocuments(id);
  }, [id]);

  async function loadDocuments(vehicleId: string) {
    setLoadingDocuments(true);
    setDocumentsError(null);

    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/vehicles/${vehicleId}/documentos`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const messages = normalizeMessage(data?.message);
        setDocumentsError(messages[0] ?? "No se pudo cargar los documentos");
        setDocuments([]);
        return;
      }

      const docs = Array.isArray(data?.documents) ? data.documents : [];
      setDocuments(docs as VehicleLegalDocument[]);
    } catch {
      setDocumentsError("No se pudo conectar con el servidor.");
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  }

  async function onUploadDocument(e: React.FormEvent) {
    e.preventDefault();
    setDocumentsError(null);
    setDocumentSuccessMsg(null);

    if (!id) {
      setDocumentsError("Falta el ID del vehículo.");
      return;
    }

    if (!documentForm.expiresAt) {
      setDocumentsError("Debes indicar la fecha de vencimiento.");
      return;
    }

    if (!documentForm.file) {
      setDocumentsError("Debes seleccionar un archivo.");
      return;
    }

    setUploadingDocument(true);
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append("type", documentForm.type);
      formData.append("expiresAt", documentForm.expiresAt);
      formData.append("file", documentForm.file);

      const res = await fetch(`${API_URL}/vehicles/${id}/documentos`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const messages = normalizeMessage(data?.message);
        setDocumentsError(messages[0] ?? "No se pudo subir el documento");
        return;
      }

      setDocumentSuccessMsg(data?.message ?? "Documento cargado con éxito");
      setDocumentForm({
        type: "SOAT",
        expiresAt: "",
        file: null,
      });
      setFileInputKey((prev) => prev + 1);
      await loadDocuments(id);
    } catch {
      setDocumentsError("No se pudo conectar con el servidor.");
    } finally {
      setUploadingDocument(false);
    }
  }

  async function onDownloadDocument(document: VehicleLegalDocument) {
    if (!id) return;

    setDownloadingDocumentId(document.id);
    setDocumentsError(null);
    setDocumentSuccessMsg(null);

    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/vehicles/${id}/documentos/${document.id}/descargar`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const messages = normalizeMessage(data?.message);
        setDocumentsError(messages[0] ?? "No se pudo descargar el documento");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.originalName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      setDocumentsError("No se pudo conectar con el servidor.");
    } finally {
      setDownloadingDocumentId(null);
    }
  }

  function formatDate(date: string): string {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleDateString("es-CO");
  }

  function formatFileSize(size: number): string {
    if (!Number.isFinite(size) || size <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const power = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
    const value = size / 1024 ** power;
    return `${value.toFixed(power === 0 ? 0 : 1)} ${units[power]}`;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Documentos del vehículo</h1>
          <p className="text-sm text-slate-400">Sube, lista y descarga documentos legales.</p>
        </div>

        <div className="flex items-center gap-2">
          {id && (
            <button
              type="button"
              onClick={() => navigate(`/vehicles/${id}/edit`)}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900/60 transition cursor-pointer"
            >
              Editar vehículo
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

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        {documentsError && (
          <div className="mb-4 rounded-xl border border-red-900/50 bg-red-950/40 p-3 text-sm text-red-200">
            {documentsError}
          </div>
        )}

        {documentSuccessMsg && (
          <div className="mb-4 rounded-xl border border-emerald-900/50 bg-emerald-950/40 p-3 text-sm text-emerald-200">
            {documentSuccessMsg}
          </div>
        )}

        <form onSubmit={onUploadDocument} className="space-y-3 rounded-xl border border-slate-800 p-4">
          <h2 className="text-sm font-semibold text-slate-200">Subir documento</h2>
          <div>
            <label className="text-sm text-slate-300">Tipo</label>
            <select
              value={documentForm.type}
              onChange={(e) =>
                setDocumentForm((prev) => ({
                  ...prev,
                  type: e.target.value as VehicleDocumentType,
                }))
              }
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 outline-none focus:border-slate-600"
            >
              {DOCUMENT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-300">Vence el</label>
            <input
              type="date"
              value={documentForm.expiresAt}
              onChange={(e) =>
                setDocumentForm((prev) => ({
                  ...prev,
                  expiresAt: e.target.value,
                }))
              }
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 outline-none focus:border-slate-600"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Archivo (PDF/JPG/PNG - máx 8MB)</label>
            <input
              key={fileInputKey}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={(e) =>
                setDocumentForm((prev) => ({
                  ...prev,
                  file: e.target.files?.[0] ?? null,
                }))
              }
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-slate-900"
            />
          </div>

          <button
            disabled={uploadingDocument}
            className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-white transition disabled:opacity-60 cursor-pointer"
          >
            {uploadingDocument ? "Subiendo..." : "Subir documento"}
          </button>
        </form>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-200">Documentos cargados</h3>
            <button
              type="button"
              onClick={() => {
                if (id) void loadDocuments(id);
              }}
              className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:bg-slate-900/60 transition cursor-pointer"
            >
              Refrescar
            </button>
          </div>

          {loadingDocuments && <p className="text-sm text-slate-400">Cargando documentos...</p>}

          {!loadingDocuments && documents.length === 0 && (
            <p className="text-sm text-slate-400">No hay documentos cargados para este vehículo.</p>
          )}

          {!loadingDocuments && documents.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/60 text-slate-300">
                  <tr>
                    <th className="px-3 py-2 text-left">Tipo</th>
                    <th className="px-3 py-2 text-left">Archivo</th>
                    <th className="px-3 py-2 text-left">Estado</th>
                    <th className="px-3 py-2 text-left">Vence</th>
                    <th className="px-3 py-2 text-left">Tamaño</th>
                    <th className="px-3 py-2 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="border-t border-slate-800">
                      <td className="px-3 py-2">{doc.type}</td>
                      <td className="px-3 py-2">{doc.originalName}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            doc.status === "VIGENTE"
                              ? "bg-emerald-950/70 text-emerald-200"
                              : "bg-red-950/70 text-red-200"
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">{formatDate(doc.expiresAt)}</td>
                      <td className="px-3 py-2">{formatFileSize(doc.size)}</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          disabled={downloadingDocumentId === doc.id}
                          onClick={() => onDownloadDocument(doc)}
                          className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:bg-slate-900/60 transition disabled:opacity-60 cursor-pointer"
                        >
                          {downloadingDocumentId === doc.id ? "Descargando..." : "Descargar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
