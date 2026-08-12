"use client";

import { useRef, useState, useTransition } from "react";

export function PhotoUploader({
  photos,
  saveAction,
  compact = false,
}: {
  photos: string[];
  saveAction: (photos: string[]) => Promise<void>;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setUploading(true);
    try {
      const paths: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Falha no upload");
        paths.push(data.path);
      }
      startTransition(() => saveAction([...photos, ...paths]));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no upload");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(path: string) {
    startTransition(() => saveAction(photos.filter((p) => p !== path)));
  }

  const size = compact ? "h-16 w-16" : "h-24 w-24";

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {photos.map((p) => (
          <div key={p} className={`relative ${size} rounded-lg overflow-hidden group border border-white/12`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p} alt="Foto" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(p)}
              className="absolute top-1 right-1 hidden group-hover:flex bg-base/80 text-white rounded-full w-5 h-5 items-center justify-center text-xs cursor-pointer"
              aria-label="Remover foto"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || pending}
          className={`${size} rounded-lg border-2 border-dashed border-white/12 text-white/35 hover:border-gold hover:text-gold transition-colors text-xs cursor-pointer disabled:opacity-50`}
        >
          {uploading || pending ? "..." : "+ foto"}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="text-xs text-signal-bad mt-1">{error}</p>}
    </div>
  );
}
