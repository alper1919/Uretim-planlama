import { useEffect, useRef, useState } from "react";
import { api, fileUrl } from "@/lib/api";
import { Loader2, AlertTriangle, Download, Box } from "lucide-react";

const THREE_D = ["stl", "obj", "ply", "gltf", "glb", "3ds", "fbx", "step", "stp", "off", "brep", "3mf", "dae", "wrl", "3dm"];
const ext = (name) => (name.split(".").pop() || "").toLowerCase();

export default function CadViewer({ drawing }) {
  const ref = useRef(null);
  const [status, setStatus] = useState("loading");
  const e = ext(drawing.original_filename);

  useEffect(() => {
    let viewer;
    let cancelled = false;
    let blobUrl;

    (async () => {
      if (e === "dwg") { setStatus("unsupported"); return; }
      try {
        const res = await api.get(`/files/${drawing.storage_path}`, { responseType: "blob" });
        if (cancelled) return;
        const file = new File([res.data], drawing.original_filename, { type: drawing.content_type });

        if (e === "dxf") {
          const mod = await import("dxf-viewer");
          const DxfViewer = mod.DxfViewer || mod.default;
          const dxf = new DxfViewer(ref.current, { autoResize: true, colorCorrection: true });
          viewer = dxf;
          blobUrl = URL.createObjectURL(file);
          await dxf.Load({ url: blobUrl, fonts: [] });
          if (cancelled) return;
          setStatus("ready");
        } else if (THREE_D.includes(e)) {
          const OV = await import("online-3d-viewer");
          OV.SetExternalLibLocation("https://cdn.jsdelivr.net/npm/occt-import-js@0.0.23/dist");
          const params = {
            backgroundColor: new OV.RGBAColor(11, 15, 23, 255),
            defaultColor: new OV.RGBColor(203, 213, 225),
            onModelLoaded: () => { if (!cancelled) setStatus("ready"); },
          };
          viewer = new OV.EmbeddedViewer(ref.current, params);
          viewer.LoadModelFromFileList([file]);
          setStatus("ready");
        } else {
          setStatus("unsupported");
        }
      } catch (err) {
        console.error("CAD viewer error", err);
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      try { viewer?.Destroy?.(); } catch { /* noop */ }
    };
  }, [drawing, e]);

  return (
    <div className="relative w-full h-[70vh] max-h-[560px] rounded-lg overflow-hidden bg-[#0B0F17] border border-[#2A364F]" data-testid="cad-viewer">
      <div ref={ref} className="w-full h-full" />

      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0B0F17]/80">
          <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
          <p className="text-slate-400 text-sm font-mono">3B model yükleniyor…</p>
        </div>
      )}

      {(status === "unsupported" || status === "error") && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6 bg-[#0B0F17]">
          <div className="w-14 h-14 rounded-2xl bg-amber-950/40 border border-amber-700/50 flex items-center justify-center">
            {status === "unsupported" ? <Box className="w-7 h-7 text-amber-400" /> : <AlertTriangle className="w-7 h-7 text-red-400" />}
          </div>
          <p className="text-white font-semibold">
            {status === "unsupported" ? "Bu format tarayıcıda önizlenemiyor" : "Model görüntülenemedi"}
          </p>
          <p className="text-slate-400 text-sm max-w-md">
            {status === "unsupported"
              ? "DWG dosyaları tarayıcıda doğrudan gösterilemez. Gerçek önizleme için dosyayı STEP (.step) veya DXF (.dxf) olarak dışa aktarın; bu formatlar burada 3B/teknik olarak görüntülenir."
              : "Dosya bozuk olabilir ya da bu sürüm desteklenmiyor. Dosyayı indirerek CAD programınızda açabilirsiniz."}
          </p>
          <a href={fileUrl(drawing.storage_path)} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 mt-1 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition-colors"
            data-testid="cad-download-fallback">
            <Download className="w-4 h-4" /> Dosyayı İndir
          </a>
        </div>
      )}
    </div>
  );
}
