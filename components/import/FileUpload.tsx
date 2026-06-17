"use client";

import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFile: (file: File) => void;
  accept?: string;
  label?: string;
  sublabel?: string;
}

export function FileUpload({ onFile, accept = ".csv,.xlsx,.xls", label = "Drop your CSV or Excel file", sublabel = "Supports .csv, .xlsx, .xls" }: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); onFile(f); }
  }, [onFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); onFile(f); }
  };

  const clear = () => setFile(null);

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
        dragging ? "border-indigo-500 bg-indigo-500/10" : "border-zinc-700 hover:border-zinc-500 bg-zinc-900/30",
        file && "border-emerald-600/50 bg-emerald-500/5"
      )}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !file && document.getElementById("file-input")?.click()}
    >
      <input id="file-input" type="file" accept={accept} className="hidden" onChange={handleChange} />

      {file ? (
        <div className="flex items-center justify-center gap-3">
          <FileSpreadsheet className="w-8 h-8 text-emerald-400" />
          <div className="text-left">
            <div className="text-sm font-medium text-white">{file.name}</div>
            <div className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB</div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); clear(); }}
            className="ml-2 p-1 hover:bg-zinc-700 rounded-full text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div>
          <Upload className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <div className="text-sm font-medium text-zinc-300">{label}</div>
          <div className="text-xs text-zinc-500 mt-1">{sublabel}</div>
        </div>
      )}
    </div>
  );
}
