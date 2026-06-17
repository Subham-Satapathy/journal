"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/import/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Camera, FileSpreadsheet, Pencil, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type ImportMode = "csv" | "screenshot" | "manual";
type CsvStep = "upload" | "mapping" | "done";
type ScreenshotStep = "upload" | "review" | "done";

const TRADE_FIELDS = [
  { key: "symbol", label: "Symbol", required: true },
  { key: "side", label: "Side (BUY/SELL/LONG/SHORT)", required: true },
  { key: "date", label: "Date/Time", required: true },
  { key: "entryPrice", label: "Entry Price", required: true },
  { key: "exitPrice", label: "Exit Price" },
  { key: "quantity", label: "Quantity/Size" },
  { key: "pnl", label: "P&L" },
  { key: "pnlPercent", label: "P&L %" },
  { key: "fees", label: "Fees" },
  { key: "closeDate", label: "Close Date" },
  { key: "exchange", label: "Exchange" },
];

export default function ImportPage() {
  const router = useRouter();
  const [mode, setMode] = useState<ImportMode | null>(null);

  // CSV state
  const [csvStep, setCsvStep] = useState<CsvStep>("upload");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvSample, setCsvSample] = useState<string[][]>([]);
  const [csvMapping, setCsvMapping] = useState<Record<string, string | null>>({});
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvTotal, setCsvTotal] = useState(0);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvResult, setCsvResult] = useState<{ imported: number; skipped?: number; message?: string } | null>(null);
  const [csvAiMapped, setCsvAiMapped] = useState(false);

  // Screenshot state
  const [ssStep, setSsStep] = useState<ScreenshotStep>("upload");
  const [ssFile, setSsFile] = useState<File | null>(null);
  const [ssLoading, setSsLoading] = useState(false);
  const [ssExtracted, setSsExtracted] = useState<Record<string, unknown>[]>([]);
  const [ssSaved, setSsSaved] = useState(false);

  // Manual state
  const [manualForm, setManualForm] = useState({
    symbol: "", side: "LONG", entryPrice: "", exitPrice: "", quantity: "1",
    pnl: "", pnlPercent: "", fees: "0", date: new Date().toISOString().slice(0, 16),
    exchange: "", notes: "", tags: "",
  });
  const [manualLoading, setManualLoading] = useState(false);
  const [manualDone, setManualDone] = useState(false);

  // Smart local column guesser — used as fallback when Gemini is unavailable
  const guessMapping = (headers: string[]): Record<string, string | null> => {
    const lower = headers.map((h) => h.toLowerCase().trim());
    const find = (...terms: string[]) =>
      headers[lower.findIndex((h) => terms.some((t) => h.includes(t)))] ?? null;
    return {
      symbol:     find("symbol", "pair", "ticker", "coin", "asset", "instrument"),
      side:       find("side", "direction", "type", "position", "action"),
      date:       find("open time", "open date", "date", "time", "entry time", "created"),
      entryPrice: find("entry price", "open price", "entry", "open", "avg entry", "avg. entry"),
      exitPrice:  find("exit price", "close price", "exit", "close", "avg exit", "avg. exit"),
      quantity:   find("quantity", "size", "amount", "qty", "volume", "contracts", "lots"),
      pnl:        find("realized pnl", "pnl", "profit", "p&l", "net profit", "profit & loss"),
      pnlPercent: find("pnl%", "roi", "return%", "profit%", "roe"),
      fees:       find("fee", "commission", "cost"),
      closeDate:  find("close time", "close date", "exit time"),
      exchange:   find("exchange", "broker", "platform"),
    };
  };

  // CSV handlers
  const handleCsvFile = async (file: File) => {
    setCsvFile(file);
    setCsvLoading(true);
    setCsvAiMapped(false);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("action", "preview");
      const res = await fetch("/api/import/csv", { method: "POST", body: fd });
      const data = await res.json();
      if (data.error) { alert(data.error); return; }
      const headers = data.headers || [];
      setCsvHeaders(headers);
      setCsvSample(data.sampleRows || []);
      setCsvTotal(data.totalRows || 0);
      // Use AI mapping if returned, else fall back to local guess
      if (data.mapping && Object.values(data.mapping).some(Boolean)) {
        setCsvMapping(data.mapping);
        setCsvAiMapped(true);
      } else {
        setCsvMapping(guessMapping(headers));
        setCsvAiMapped(false);
      }
      setCsvStep("mapping");
    } catch {
      alert("Failed to parse file. Make sure it is a valid .csv or .xlsx file.");
    } finally {
      setCsvLoading(false);
    }
  };

  const handleCsvImport = async () => {
    if (!csvFile) return;
    setCsvLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", csvFile);
      fd.append("action", "import");
      fd.append("mapping", JSON.stringify(csvMapping));
      const res = await fetch("/api/import/csv", { method: "POST", body: fd });
      const data = await res.json();
      if (data.error) { alert(data.error); return; }
      setCsvResult(data);
      setCsvStep("done");
      // Auto-redirect to dashboard after 2 seconds
      setTimeout(() => router.push("/"), 2000);
    } catch (e) {
      alert("Import failed");
    } finally {
      setCsvLoading(false);
    }
  };

  // Screenshot handlers
  const handleSsFile = async (file: File) => {
    setSsFile(file);
    setSsLoading(true);
    setSsStep("upload");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("action", "extract");
      const res = await fetch("/api/import/screenshot", { method: "POST", body: fd });
      const data = await res.json();
      if (data.error) { alert(data.error); return; }
      setSsExtracted(data.trades || []);
      setSsStep("review");
    } catch (e) {
      alert("Extraction failed");
    } finally {
      setSsLoading(false);
    }
  };

  const handleSsSave = async () => {
    if (!ssFile) return;
    setSsLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", ssFile);
      fd.append("action", "save");
      fd.append("trades", JSON.stringify(ssExtracted));
      const res = await fetch("/api/import/screenshot", { method: "POST", body: fd });
      const data = await res.json();
      if (data.error) { alert(data.error); return; }
      setSsSaved(true);
      setSsStep("done");
      setTimeout(() => router.push("/"), 2000);
    } catch (e) {
      alert("Save failed");
    } finally {
      setSsLoading(false);
    }
  };

  // Manual handler
  const handleManualSave = async () => {
    setManualLoading(true);
    try {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...manualForm, importSource: "manual" }),
      });
      if (!res.ok) { const d = await res.json(); alert(d.error); return; }
      setManualDone(true);
      setManualForm({
        symbol: "", side: "LONG", entryPrice: "", exitPrice: "", quantity: "1",
        pnl: "", pnlPercent: "", fees: "0", date: new Date().toISOString().slice(0, 16),
        exchange: "", notes: "", tags: "",
      });
      setTimeout(() => setManualDone(false), 3000);
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Import Trades</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Add trades via CSV/Excel, screenshot, or manual entry</p>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { key: "csv" as ImportMode, icon: FileSpreadsheet, title: "CSV / Excel", desc: "Upload .csv or .xlsx files" },
          { key: "screenshot" as ImportMode, icon: Camera, title: "Screenshot", desc: "AI extracts trades from image" },
          { key: "manual" as ImportMode, icon: Pencil, title: "Manual Entry", desc: "Enter trade details manually" },
        ].map(({ key, icon: Icon, title, desc }) => (
          <button
            key={key}
            onClick={() => { setMode(key); setCsvStep("upload"); setSsStep("upload"); setSsExtracted([]); }}
            className={`p-4 rounded-xl border text-left transition-all ${
              mode === key
                ? "border-indigo-500 bg-indigo-500/10"
                : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
            }`}
          >
            <Icon className={`w-6 h-6 mb-2 ${mode === key ? "text-indigo-400" : "text-zinc-500"}`} />
            <div className="text-sm font-medium text-white">{title}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{desc}</div>
          </button>
        ))}
      </div>

      {/* CSV Import */}
      {mode === "csv" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white">
              {csvStep === "upload" ? "Upload File" : csvStep === "mapping" ? "Map Columns" : "Import Complete"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {csvStep === "upload" && (
              <div className="space-y-4">
                <FileUpload onFile={handleCsvFile} />
                {csvLoading && <div className="text-sm text-zinc-400 text-center py-4">Parsing file and detecting columns with AI...</div>}
              </div>
            )}

            {csvStep === "mapping" && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg border text-xs
                  ${csvAiMapped ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' : 'bg-amber-500/10 border-amber-500/20 text-amber-300'}">
                  <div>
                    Found <span className="text-white font-semibold">{csvTotal} rows</span>.{" "}
                    {csvAiMapped
                      ? "✨ Gemini AI auto-mapped your columns — verify below before importing."
                      : "⚡ Columns were auto-guessed (Gemini unavailable). Please verify the mapping below before importing."}
                  </div>
                </div>

                {/* Sample preview */}
                <div className="overflow-x-auto rounded-lg border border-zinc-800">
                  <table className="text-xs w-full">
                    <thead>
                      <tr className="bg-zinc-900">
                        {csvHeaders.map((h) => <th key={h} className="px-3 py-2 text-left text-zinc-500">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {csvSample.map((row, i) => (
                        <tr key={i} className="border-t border-zinc-800">
                          {row.map((cell, j) => <td key={j} className="px-3 py-2 text-zinc-400">{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mapping UI */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {TRADE_FIELDS.map(({ key, label, required }) => (
                    <div key={key}>
                      <label className="text-xs text-zinc-400 mb-1 block">
                        {label} {required && <span className="text-red-400">*</span>}
                      </label>
                      <select
                        value={csvMapping[key] || ""}
                        onChange={(e) => setCsvMapping((m) => ({ ...m, [key]: e.target.value || null }))}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 outline-none"
                      >
                        <option value="">— skip —</option>
                        {csvHeaders.map((h) => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Required field validation */}
                {(["symbol","side","date","entryPrice"] as const).some((f) => !csvMapping[f]) && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    Please map the required fields: <strong>Symbol, Side, Date, Entry Price</strong> before importing.
                  </div>
                )}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCsvStep("upload")}>Back</Button>
                  <Button
                    onClick={handleCsvImport}
                    loading={csvLoading}
                    disabled={(["symbol","side","date","entryPrice"] as const).some((f) => !csvMapping[f])}
                  >
                    Import {csvTotal} Trades <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {csvStep === "done" && csvResult && (
              <div className="flex flex-col items-center py-8 text-center gap-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                <div className="text-xl font-bold text-white">
                  {csvResult.imported > 0 ? `${csvResult.imported} new trades imported!` : "No new trades"}
                </div>
                {csvResult.skipped != null && csvResult.skipped > 0 && (
                  <div className="text-sm text-zinc-500 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-zinc-800 rounded-full text-xs">{csvResult.skipped} duplicates skipped</span>
                    <span className="text-zinc-600">— already in your journal</span>
                  </div>
                )}
                <p className="text-xs text-zinc-600">Redirecting to dashboard...</p>
                <div className="flex gap-3 mt-1">
                  <Button variant="outline" onClick={() => { setCsvStep("upload"); setCsvFile(null); }}>Import More</Button>
                  <a href="/trades" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors">
                    View Trades
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Screenshot Import */}
      {mode === "screenshot" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white">
              {ssStep === "upload" ? "Upload Screenshot" : ssStep === "review" ? "Review Extracted Trades" : "Saved!"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ssStep === "upload" && (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                  Gemini AI will analyze your screenshot and extract trade data automatically.
                </div>
                <FileUpload
                  onFile={handleSsFile}
                  accept="image/jpeg,image/png,image/webp"
                  label="Drop your trading screenshot here"
                  sublabel="Supports JPG, PNG, WebP — exchange screenshots, MT4/5, TradingView, etc."
                />
                {ssLoading && (
                  <div className="flex items-center justify-center gap-3 py-6 text-sm text-zinc-400">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    Gemini AI is analyzing your screenshot...
                  </div>
                )}
              </div>
            )}

            {ssStep === "review" && (
              <div className="space-y-4">
                <div className="text-sm text-zinc-400">
                  Extracted <span className="text-white font-medium">{ssExtracted.length} trade(s)</span>. Review and confirm before saving.
                </div>
                {ssExtracted.length === 0 ? (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <div className="text-sm text-amber-300">No trades could be extracted. Try a clearer screenshot or use manual entry.</div>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-zinc-800">
                    <table className="text-xs w-full">
                      <thead>
                        <tr className="bg-zinc-900 border-b border-zinc-800">
                          {["Symbol", "Side", "Entry", "Exit", "Qty", "P&L", "Date", "Exchange"].map((h) => (
                            <th key={h} className="px-3 py-2 text-left text-zinc-500">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {ssExtracted.map((t, i) => (
                          <tr key={i} className="border-b border-zinc-800/50">
                            <td className="px-3 py-2 text-white font-mono">{String(t.symbol || "—")}</td>
                            <td className="px-3 py-2">
                              <span className={`px-1.5 py-0.5 rounded text-xs ${["LONG", "BUY"].includes(String(t.side || "").toUpperCase()) ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                                {String(t.side || "—")}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-zinc-300 font-mono">{t.entryPrice ? `$${t.entryPrice}` : "—"}</td>
                            <td className="px-3 py-2 text-zinc-400 font-mono">{t.exitPrice ? `$${t.exitPrice}` : "—"}</td>
                            <td className="px-3 py-2 text-zinc-400">{String(t.quantity || "—")}</td>
                            <td className={`px-3 py-2 font-mono ${Number(t.pnl) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {t.pnl !== null && t.pnl !== undefined ? `$${Number(t.pnl).toFixed(2)}` : "—"}
                            </td>
                            <td className="px-3 py-2 text-zinc-500">{t.date ? String(t.date).substring(0, 10) : "—"}</td>
                            <td className="px-3 py-2 text-zinc-500">{String(t.exchange || "—")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => { setSsStep("upload"); setSsFile(null); setSsExtracted([]); }}>
                    Try Again
                  </Button>
                  {ssExtracted.length > 0 && (
                    <Button onClick={handleSsSave} loading={ssLoading}>
                      Save {ssExtracted.length} Trade(s)
                    </Button>
                  )}
                </div>
              </div>
            )}

            {ssStep === "done" && (
              <div className="flex flex-col items-center py-8 text-center gap-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                <div className="text-xl font-bold text-white">Trades saved!</div>
                <div className="flex gap-3 mt-2">
                  <Button variant="outline" onClick={() => { setSsStep("upload"); setSsFile(null); setSsExtracted([]); }}>Import More</Button>
                  <a href="/trades" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors">
                    View Trades
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Manual Entry */}
      {mode === "manual" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white">Manual Trade Entry</CardTitle>
          </CardHeader>
          <CardContent>
            {manualDone && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-4 text-sm text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Trade saved successfully!
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: "symbol", label: "Symbol *", placeholder: "BTCUSDT", type: "text" },
                { key: "date", label: "Date & Time *", placeholder: "", type: "datetime-local" },
                { key: "entryPrice", label: "Entry Price *", placeholder: "50000", type: "number" },
                { key: "exitPrice", label: "Exit Price", placeholder: "51000", type: "number" },
                { key: "quantity", label: "Quantity", placeholder: "0.1", type: "number" },
                { key: "pnl", label: "P&L ($)", placeholder: "100", type: "number" },
                { key: "pnlPercent", label: "P&L %", placeholder: "2.5", type: "number" },
                { key: "fees", label: "Fees ($)", placeholder: "0", type: "number" },
                { key: "exchange", label: "Exchange", placeholder: "Binance", type: "text" },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="text-xs text-zinc-400 mb-1 block">{label}</label>
                  <input
                    type={type}
                    value={manualForm[key as keyof typeof manualForm]}
                    onChange={(e) => setManualForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Side *</label>
                <select
                  value={manualForm.side}
                  onChange={(e) => setManualForm((f) => ({ ...f, side: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-indigo-500"
                >
                  <option value="LONG">Long</option>
                  <option value="SHORT">Short</option>
                  <option value="BUY">Buy</option>
                  <option value="SELL">Sell</option>
                </select>
              </div>
              <div className="col-span-2 md:col-span-3">
                <label className="text-xs text-zinc-400 mb-1 block">Notes</label>
                <textarea
                  value={manualForm.notes}
                  onChange={(e) => setManualForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Trade notes, setup description..."
                  rows={2}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={handleManualSave} loading={manualLoading}>
                Save Trade
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
