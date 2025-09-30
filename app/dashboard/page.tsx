// app/dashboard/page.tsx
// Pro Dashboard UI (V1.3 + Gemini Assist)
// Steps: Upload → Presets → Refine → Mockup → Export (+ Smart Suggestions)
// Endpoints: /api/refine, /api/mockup, /api/export, /api/checkout, /api/assist
// Tailwind CSS gerekir. İkonlar: lucide-react.

'use client';

import React, { useMemo, useRef, useState } from "react";
import {
  Upload,
  Sparkles,
  Wand2,
  Image as ImageIcon,
  SlidersHorizontal,
  Download,
  ShoppingCart,
  Loader2,
  Check,
  Lightbulb,
} from "lucide-react";

// ---- Utility: POST JSON helper ----
async function postJSON<T>(url: string, body: any): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const errorJson = await r.json().catch(() => ({}));
    throw new Error(errorJson.error || `${url} failed with status ${r.status}`);
  }
  return (await r.json()) as T;
}

// ---- Compare Slider ----
function CompareSlider({ beforeSrc, afterSrc }: { beforeSrc?: string; afterSrc?: string }) {
  const [pos, setPos] = useState(50);
  if (!beforeSrc || !afterSrc) return null;
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border bg-neutral-100">
      <img src={beforeSrc} alt="before" className="block w-full select-none pointer-events-none" />
      <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img src={afterSrc} alt="after" className="block w-full select-none pointer-events-none" />
      </div>
      <input
        type="range" min={0} max={100} value={pos}
        onChange={(e) => setPos(parseInt(e.target.value))}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 w-1/2 cursor-pointer appearance-none rounded-full bg-neutral-700/60 transition-opacity"
      />
      {/* dikey ayraç çizgisi */}
      <div className="absolute inset-y-0 left-0 border-r-2 border-white pointer-events-none transition-transform" style={{ transform: `translateX(${pos}%)` }} />
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <span className="rounded-full bg-black/60 px-3 py-1 text-xs text-white">before / after</span>
      </div>
    </div>
  );
}

type AssistResp = {
  ok: boolean;
  suggestions?: string[];
  prompt_append?: string;
  notes?: string;
};

export default function ProDashboard() {
  type Step = 1 | 2 | 3 | 4 | 5;

  // ---- Step state ----
  const [step, setStep] = useState<Step>(1);

  // ---- Upload ----
  const [initUrl, setInitUrl] = useState("");
  const [localPreview, setLocalPreview] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Presets & options ----
  const [presetNoise, setPresetNoise] = useState(true);
  const [presetGrad, setPresetGrad] = useState(true);
  const [presetTriceps, setPresetTriceps] = useState(true);
  const [strength, setStrength] = useState(0.4); // 0.35–0.45 önerilir
  const [userPrompt, setUserPrompt] = useState(
    "Refine my tattoo, keep Lucifer and the Art Nouveau woman. Harmonize tones and light."
  );

  // ---- Refine ----
  const [refining, setRefining] = useState(false);
  const [refinedUrl, setRefinedUrl] = useState<string | undefined>(undefined);
  const [refProvider, setRefProvider] = useState<string | undefined>(undefined);
  const canRefine = useMemo(() => !!initUrl, [initUrl]);

  // ---- Mockup ----
  const [mocking, setMocking] = useState(false);
  const [mockUrl, setMockUrl] = useState<string | undefined>(undefined);
  const [mx, setMx] = useState(320);
  const [my, setMy] = useState(260);
  const [ms, setMs] = useState(1);

  // ---- Export ----
  const [exporting, setExporting] = useState<"png" | "pdf" | "svg" | null>(null);

  // ---- Gemini Assist ----
  const [assistBusy, setAssistBusy] = useState(false);
  const [assist, setAssist] = useState<AssistResp | null>(null);

  // seçilen presetleri API'ye iletmek için hazırla
  function selectedPresets() {
    const arr: string[] = [];
    if (presetNoise) arr.push("noiseClean");
    if (presetGrad) arr.push("softGradient");
    if (presetTriceps) arr.push("tricepsFit");
    return arr;
  }

  // Local dosya yükleme ve otomatik upload
  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    
    // Önce local preview göster
    if (localPreview) URL.revokeObjectURL(localPreview);
    const previewUrl = URL.createObjectURL(f);
    setLocalPreview(previewUrl);
    
    // Sonra otomatik upload yap
    try {
      const formData = new FormData();
      formData.append('file', f);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      if (result.ok) {
        setInitUrl(result.url);
        setStep(2); // Otomatik olarak preset adımına geç
      } else {
        alert(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      alert(`Upload error: ${error}`);
    }
    
    e.target.value = ""; // aynı dosyayı tekrar seçmeye izin ver
  }

  // --- API: Refine
  async function runRefine() {
    if (!canRefine) return;
    setRefining(true);
    setRefinedUrl(undefined);
    setRefProvider(undefined);
    try {
      const res = await postJSON<{ ok: boolean; url: string; provider: string }>(
        "/api/refine",
        {
          initUrl,
          userPrompt,
          presets: selectedPresets(),
          strength,
        }
      );
      if (res?.url) {
        setRefinedUrl(res.url);
        setRefProvider(res.provider);
        setStep(4); // Mockup adımına geç
      }
    } catch (e: any) {
      alert(`Refine failed: ${e?.message}`);
    } finally {
      setRefining(false);
    }
  }

  // --- API: Mockup
  async function runMockup() {
    if (!refinedUrl) return;
    setMocking(true);
    setMockUrl(undefined);
    try {
      const r = await fetch("/api/mockup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refinedUrl, x: mx, y: my, scale: ms }),
      });
      if (!r.ok) throw new Error("Mockup server error");
      const blob = await r.blob();
      setMockUrl(URL.createObjectURL(blob));
      setStep(5); // Export adımı
    } catch (e: any) {
      alert(`Mockup failed: ${e?.message}`);
    } finally {
      setMocking(false);
    }
  }

  // --- API: Export
  async function doExport(fmt: "png" | "pdf" | "svg") {
    if (!refinedUrl) return;
    setExporting(fmt);
    try {
      const r = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refinedUrl, format: fmt }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error || "Export server error");
      }
      const blob = await r.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `tattoo_rework_${fmt}_${Date.now()}.${fmt}`;
      a.click();
    } catch (e: any) {
      alert(`Export ${fmt} failed: ${e?.message}`);
    } finally {
      setExporting(null);
    }
  }

  // --- API: Checkout
  async function goCheckout(plan: "single" | "monthly" | "studio") {
    try {
      const mode = plan === "single" ? "payment" : "subscription";
      const r = await postJSON<{ url: string }>("/api/checkout", { plan, mode });
      window.location.href = r.url;
    } catch (e: any) {
      alert(`${plan} Checkout failed: ${e?.message}`);
    }
  }

  // --- API: Gemini Assist (öneri motoru)
  async function runAssist() {
    const imageUrl = refinedUrl || initUrl;
    if (!imageUrl) {
      alert("Analyze için önce initUrl gir veya refine sonucu üret.");
      return;
    }
    setAssistBusy(true);
    setAssist(null);
    try {
      const res = await postJSON<AssistResp>("/api/assist", {
        imageUrl,
        context: userPrompt,
        mode: refinedUrl ? "post-refine" : "pre-refine",
      });
      setAssist(res);
    } catch (e: any) {
      alert(`Assist failed: ${e?.message}`);
    } finally {
      setAssistBusy(false);
    }
  }

  function insertAssistToPrompt() {
    if (assist?.prompt_append) {
      setUserPrompt((p) => (p.trim() ? p.trim() + " " : "") + assist.prompt_append);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Topbar */}
      <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span className="font-semibold">AI Tattoo Rework</span>
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
              Pro UI v1.3 • Gemini Assist
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button className="rounded-lg border px-3 py-1.5 hover:bg-neutral-100" onClick={() => goCheckout("single")}>
              <ShoppingCart className="mr-1 inline h-4 w-4" /> Buy 1 Export
            </button>
            <button className="rounded-lg bg-black px-3 py-1.5 text-white hover:bg-neutral-800" onClick={() => goCheckout("monthly")}>
              Upgrade Monthly
            </button>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="mx-auto w-full max-w-7xl px-6 py-4">
        <ol className="flex items-center gap-4 text-sm">
          {[
            { k: 1, label: "Upload", icon: <Upload className="h-4 w-4" /> },
            { k: 2, label: "Presets", icon: <SlidersHorizontal className="h-4 w-4" /> },
            { k: 3, label: "Refine", icon: <Wand2 className="h-4 w-4" /> },
            { k: 4, label: "Mockup", icon: <ImageIcon className="h-4 w-4" /> },
            { k: 5, label: "Export", icon: <Download className="h-4 w-4" /> },
          ].map(({ k, label, icon }) => (
            <li key={k} className={`flex items-center gap-2 ${step === k ? "text-black font-medium" : "text-neutral-500"}`}>
              <span className={`grid h-7 w-7 place-items-center rounded-full border transition-colors ${
                step === k ? "border-black bg-white shadow-md" : step > k ? "border-green-500 bg-green-500 text-white" : "border-neutral-300"
              }`}>
                {step > k ? <Check className="h-4 w-4" /> : icon}
              </span>
              <span>{label}</span>
              {k < 5 && <span className="mx-2 h-px w-8 bg-neutral-300" />}
            </li>
          ))}
        </ol>
      </div>

      {/* Main grid */}
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-6 pb-12 md:grid-cols-3">
        {/* Left: Controls */}
        <div className="md:col-span-1 space-y-6">
          {/* Upload */}
          <section className="rounded-2xl border bg-white p-4 shadow-sm">
            <header className="mb-3 flex items-center gap-2">
              <Upload className="h-4 w-4 text-neutral-500" />
              <h3 className="font-semibold">1) Başlangıç Görseli</h3>
            </header>
            <div className="space-y-3">
              <label className="text-xs text-neutral-600">Init Image URL (public)</label>
              <input
                className="w-full rounded-lg border p-2 text-sm focus:border-black focus:ring-0"
                placeholder="https://... (public image URL)"
                value={initUrl}
                onChange={(e) => setInitUrl(e.target.value.replace(/\s/g, ""))} // URL'den boşlukları temizle
              />
              <div className="flex items-center gap-2">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={onPickFile} />
                <button className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-100" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-1 inline h-4 w-4" /> Dosya Seç & Upload
                </button>
              </div>
              {localPreview && (
                <img src={localPreview} alt="local preview" className="mt-2 max-h-64 w-full rounded-lg border object-contain" />
              )}
              <p className="text-xs text-neutral-500">
                Manuel URL girebilir veya yerel dosya seçerek otomatik upload yapabilirsiniz. Upload sonrası otomatik olarak preset adımına geçilir.
              </p>
              <button
                disabled={!initUrl || step >= 2}
                onClick={() => setStep(2)}
                className="w-full rounded-lg bg-black px-3 py-2 text-white disabled:cursor-not-allowed disabled:bg-neutral-300 hover:bg-neutral-800"
              >
                Devam Et → Presetler
              </button>
            </div>
          </section>

          {/* Presets */}
          <section className="rounded-2xl border bg-white p-4 shadow-sm">
            <header className="mb-3 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-neutral-500" />
              <h3 className="font-semibold">2) Presetler & Ayarlar</h3>
            </header>
            <div className="space-y-3">
              <label className="block text-xs text-neutral-600">Ön Tanımlı İyileştirmeler</label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setPresetNoise((v) => !v)} className={`rounded-full px-3 py-1 text-xs ${presetNoise ? "bg-black text-white" : "bg-neutral-200 hover:bg-neutral-300"}`}>
                  Gürültü Temizleme
                </button>
                <button onClick={() => setPresetGrad((v) => !v)} className={`rounded-full px-3 py-1 text-xs ${presetGrad ? "bg-black text-white" : "bg-neutral-200 hover:bg-neutral-300"}`}>
                  Yumuşak Geçiş
                </button>
                <button onClick={() => setPresetTriceps((v) => !v)} className={`rounded-full px-3 py-1 text-xs ${presetTriceps ? "bg-black text-white" : "bg-neutral-200 hover:bg-neutral-300"}`}>
                  Triceps Uyumlu
                </button>
              </div>

              <div>
                <label className="mb-1 block text-xs text-neutral-600">Değişim Şiddeti (Strength) ({strength.toFixed(2)})</label>
                <input type="range" min={0.2} max={0.8} step={0.01} value={strength} onChange={(e) => setStrength(parseFloat(e.target.value))} className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer" />
                <p className="text-xs text-neutral-500">Önerilen aralık: 0.35–0.45</p>
              </div>

              <div>
                <label className="mb-1 block text-xs text-neutral-600">Ek Açıklama (Custom prompt)</label>
                <textarea className="h-24 w-full rounded-lg border p-2 text-sm focus:border-black focus:ring-0" value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} />
              </div>

              <button
                disabled={!canRefine || refining}
                onClick={() => { setStep(3); runRefine(); }}
                className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-white disabled:cursor-not-allowed disabled:bg-neutral-300 hover:bg-indigo-700"
              >
                {refining ? (<><Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> İyileştirme (Refining)…</>) : (<><Wand2 className="mr-2 inline h-4 w-4" /> Refine İşlemini Başlat</>)}
              </button>
              {refProvider && <p className="text-xs text-neutral-500">Kullanılan Sağlayıcı: {refProvider}</p>}
            </div>
          </section>

          {/* Smart Suggestions (Gemini) */}
          <section className="rounded-2xl border bg-white p-4 shadow-sm">
            <header className="mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <h3 className="font-semibold">Smart Suggestions (Gemini)</h3>
            </header>
            <p className="mb-2 text-xs text-neutral-600">Refine öncesi/sonrası görseli analiz edip kısa iyileştirme önerileri üretir.</p>
            <div className="flex gap-2">
              <button
                onClick={runAssist}
                className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-100 disabled:opacity-50"
                disabled={assistBusy || (!initUrl && !refinedUrl)}
              >
                {assistBusy ? <><Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Analyzing…</> : "Analyze current"}
              </button>
              <button
                onClick={insertAssistToPrompt}
                className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:bg-neutral-800 disabled:opacity-50"
                disabled={!assist?.prompt_append}
              >
                Insert to Prompt
              </button>
            </div>
            {!!assist?.suggestions?.length && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                {assist.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            )}
            {!!assist?.notes && <p className="mt-2 text-xs text-neutral-500">{assist.notes}</p>}
          </section>

          {/* Export / Checkout */}
          <section className="rounded-2xl border bg-white p-4 shadow-sm">
            <header className="mb-3 flex items-center gap-2">
              <Download className="h-4 w-4 text-neutral-500" />
              <h3 className="font-semibold">5) İndir ve Ödeme</h3>
            </header>
            <label className="mb-2 block text-xs text-neutral-600">Baskıya Hazır Çıktı Formatları</label>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => doExport("png")} disabled={!refinedUrl || exporting==="png"} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50 hover:bg-neutral-100">
                PNG (4K) {exporting==="png" && <Loader2 className="ml-1 inline h-4 w-4 animate-spin" />}
              </button>
              <button onClick={() => doExport("svg")} disabled={!refinedUrl || exporting==="svg"} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50 hover:bg-neutral-100">
                SVG (Vektör) {exporting==="svg" && <Loader2 className="ml-1 inline h-4 w-4 animate-spin" />}
              </button>
              <button onClick={() => doExport("pdf")} disabled={!refinedUrl || exporting==="pdf"} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50 hover:bg-neutral-100">
                PDF {exporting==="pdf" && <Loader2 className="ml-1 inline h-4 w-4 animate-spin" />}
              </button>
            </div>
            <label className="mt-4 mb-2 block text-xs text-neutral-600">Ödeme Seçenekleri</label>
            <div className="flex flex-wrap gap-2">
              <button className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-100" onClick={() => goCheckout("single")}><ShoppingCart className="mr-1 inline h-4 w-4"/>Tek İndirme ($3.99)</button>
              <button className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:bg-neutral-800" onClick={() => goCheckout("monthly")}>Aylık Abonelik ($6.99)</button>
            </div>
          </section>
        </div>

        {/* Right: Visual Workbench */}
        <div className="md:col-span-2 space-y-6">
          {/* 3) Preview & Compare */}
          <section className="rounded-2xl border bg-white p-4 shadow-sm">
            <header className="mb-3 flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-neutral-500" />
              <h3 className="font-semibold">3) Önizleme ve Karşılaştırma</h3>
            </header>
            {!refinedUrl ? (
              <div className="grid min-h-[300px] place-items-center text-sm text-neutral-500 rounded-xl border border-dashed bg-neutral-50/70">
                {!refining && "Refine başarılı olduğunda burada 'Önce/Sonra' sürgüsü görünecek."}
                {refining && (<><Loader2 className="mr-2 inline h-4 w-4 animate-spin"/> İyileştirme işlemi devam ediyor…</>)}
              </div>
            ) : (
              <CompareSlider beforeSrc={initUrl || localPreview} afterSrc={refinedUrl} />
            )}
          </section>

          {/* 4) Mockup */}
          <section className="rounded-2xl border bg-white p-4 shadow-sm">
            <header className="mb-3 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-neutral-500" />
              <h3 className="font-semibold">4) Vücut Mockup'ı (Triceps)</h3>
            </header>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <div className="grid min-h-[300px] place-items-center overflow-hidden rounded-2xl border bg-neutral-100">
                  {mockUrl ? (
                    <img src={mockUrl} alt="Triceps Mockup" className="block w-full"/>
                  ) : (
                    <div className="p-6 text-sm text-neutral-500">Görseli konumlandırmak için "Run Mockup" butonuna basın.</div>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-neutral-700">Mockup Ayarları</label>
                <div>
                  <label className="mb-1 block text-xs text-neutral-600">Yatay Konum (X: {mx})</label>
                  <input type="range" min={0} max={800} value={mx} onChange={(e)=>setMx(parseInt(e.target.value))} className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"/>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-neutral-600">Dikey Konum (Y: {my})</label>
                  <input type="range" min={0} max={1000} value={my} onChange={(e)=>setMy(parseInt(e.target.value))} className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"/>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-neutral-600">Ölçek (Scale: {ms.toFixed(2)})</label>
                  <input type="range" min={0.5} max={2} step={0.01} value={ms} onChange={(e)=>setMs(parseFloat(e.target.value))} className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"/>
                </div>
                <button
                  className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-white disabled:opacity-50 hover:bg-indigo-700 transition-colors"
                  disabled={!refinedUrl || mocking}
                  onClick={runMockup}
                >
                  {mocking ? (<><Loader2 className="mr-2 inline h-4 w-4 animate-spin"/> Mockup Oluşturuluyor…</>) : (<>Run Mockup</>)}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer className="border-t bg-white/60 py-6 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} AI Tattoo Rework • Pro UI v1.3
      </footer>

      {/* Test rozeti - Tailwind çalışıyor mu kontrol et */}
      <div className="fixed bottom-2 right-2 z-[9999] rounded bg-emerald-600 px-2 py-1 text-xs text-white">
        TW OK
      </div>
    </div>
  );
}