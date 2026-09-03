import { useEffect, useState } from "react";
import { api, fileUrl } from "@/lib/api";
import CadViewer from "@/components/CadViewer";
import { Loader2, AlertTriangle, Download } from "lucide-react";

const isImage = (ct) => ct?.startsWith("image/");
const isPdf = (ct) => ct === "application/pdf";
const CAD_EXT = ["stl", "obj", "ply", "gltf", "glb", "3ds", "fbx", "step", "stp", "off", "brep", "3mf", "dae", "wrl", "3dm", "dxf", "dwg"];
const isCad = (name) => CAD_EXT.includes((name.split(".").pop() || "").toLowerCase());

// Fetches the file as a blob via axios (carries auth the same way as working API calls),
// avoiding httpOnly-cookie-on-subresource issues when the app runs inside an embedded iframe.
export default function FilePreview({ drawing }) {
  const cad = isCad(drawing.original_filename);
  const [url, setUrl] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (cad) return;
    let obj;
    let cancelled = false;
    setUrl(null);
    setErr(false);
    (async () => {
      try {
        const res = await api.get(`/files/${drawing.storage_path}`, { responseType: "blob" });
        if (cancelled) return;
        const blob = new Blob([res.data], { type: drawing.content_type || res.data.type });
        obj = URL.createObjectURL(blob);
        setUrl(obj);
      } catch {
        if (!cancelled) setErr(true);
      }
    })();
    return () => { cancelled = true; if (obj) URL.revokeObjectURL(obj); };
  }, [drawing, cad]);

  if (cad) return <CadViewer drawing={drawing} />;

  if (err) {
    return (
      <div className="w-full h-[70vh] max-h-[560px] rounded-lg bg-[#0B0F17] border border-[#2A364F] flex flex-col items-center justify-center gap-3 text-center px-6" data-testid="file-preview-error">
        <div className="w-14 h-14 rounded-2xl bg-red-950/40 border border-red-700/50 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <p className="text-white font-semibold">Dosya görüntülenemedi</p>
        <a href={fileUrl(drawing.storage_path)} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition-colors">
          <Download className="w-4 h-4" /> Dosyayı İndir
        </a>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="w-full h-[70vh] max-h-[560px] rounded-lg bg-[#0B0F17] border border-[#2A364F] flex flex-col items-center justify-center gap-3" data-testid="file-preview-loading">
        <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
        <p className="text-slate-400 text-sm font-mono">Dosya yükleniyor…</p>
      </div>
    );
  }

  if (isImage(drawing.content_type)) {
    return <img src={url} alt={drawing.original_filename} className="w-full h-full object-contain max-h-[85vh] rounded" data-testid="file-preview-image" />;
  }
  if (isPdf(drawing.content_type)) {
    return <iframe title={drawing.original_filename} src={url} className="w-full h-[85vh] rounded bg-white" data-testid="file-preview-pdf" />;
  }
  return (
    <div className="w-full h-[40vh] rounded-lg bg-[#0B0F17] border border-[#2A364F] flex items-center justify-center">
      <a href={fileUrl(drawing.storage_path)} target="_blank" rel="noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition-colors">
        <Download className="w-4 h-4" /> Dosyayı İndir
      </a>
    </div>
  );
}
