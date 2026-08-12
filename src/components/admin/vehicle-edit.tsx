"use client";

import { useState, useTransition } from "react";
import { deleteVehicle, updateVehicle } from "@/app/admin/actions";

const inputCls =
  "w-full rounded-lg border border-white/12 bg-surface px-3 py-2 text-sm outline-none focus:border-gold";
const labelCls = "block text-xs font-semibold text-white/60 mb-1";

export interface VehicleEditData {
  id: string;
  color: string | null;
  engine: string | null;
  engineFamily: string | null;
  status: string;
  auctioneer: string | null;
  auctionName: string | null;
  lotNumber: string | null;
  auctionDate: string | null; // yyyy-mm-dd
  purchaseValue: number | null;
  auctionNotes: string | null;
}

export function VehicleEdit({ vehicle }: { vehicle: VehicleEditData }) {
  const [form, setForm] = useState({
    color: vehicle.color ?? "",
    engine: vehicle.engine ?? "",
    engineFamily: vehicle.engineFamily ?? "",
    status: vehicle.status,
    auctioneer: vehicle.auctioneer ?? "",
    auctionName: vehicle.auctionName ?? "",
    lotNumber: vehicle.lotNumber ?? "",
    auctionDate: vehicle.auctionDate ?? "",
    purchaseValue: vehicle.purchaseValue?.toString() ?? "",
    auctionNotes: vehicle.auctionNotes ?? "",
  });
  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    startTransition(async () => {
      await updateVehicle(vehicle.id, {
        color: form.color || null,
        engine: form.engine || null,
        engineFamily: form.engineFamily || null,
        status: form.status,
        auctioneer: form.auctioneer || null,
        auctionName: form.auctionName || null,
        lotNumber: form.lotNumber || null,
        auctionDate: form.auctionDate || null,
        purchaseValue: form.purchaseValue ? Number(form.purchaseValue) : null,
        auctionNotes: form.auctionNotes || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  function handleDelete() {
    if (
      !confirm(
        "Excluir este veículo apaga também TODAS as peças dele. Tem certeza?",
      )
    )
      return;
    startTransition(() => deleteVehicle(vehicle.id));
  }

  return (
    <details className="bg-surface rounded-2xl shadow-card">
      <summary className="display text-sm text-white px-6 py-4 cursor-pointer select-none">
        ✏️ Editar dados do veículo e do leilão
      </summary>
      <div className="px-6 pb-6 space-y-4 border-t border-white/8 pt-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className={labelCls}>Status</label>
            <select
              className={inputCls}
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            >
              <option value="DESMANCHE">Em desmanche</option>
              <option value="FINALIZADO">Finalizado</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Cor</label>
            <input className={inputCls} value={form.color} onChange={(e) => set("color", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Motor</label>
            <input className={inputCls} value={form.engine} onChange={(e) => set("engine", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Família do motor</label>
            <input className={inputCls} value={form.engineFamily} onChange={(e) => set("engineFamily", e.target.value)} />
          </div>
        </div>
        <p className="text-xs font-semibold text-white/35 uppercase tracking-wide">
          Leilão (privado — nunca aparece na loja)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div>
            <label className={labelCls}>Leiloeiro</label>
            <input className={inputCls} value={form.auctioneer} onChange={(e) => set("auctioneer", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Leilão / edital</label>
            <input className={inputCls} value={form.auctionName} onChange={(e) => set("auctionName", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Lote</label>
            <input className={inputCls} value={form.lotNumber} onChange={(e) => set("lotNumber", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Data</label>
            <input type="date" className={inputCls} value={form.auctionDate} onChange={(e) => set("auctionDate", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Arremate (R$)</label>
            <input type="number" min="0" step="0.01" className={inputCls} value={form.purchaseValue} onChange={(e) => set("purchaseValue", e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Observações</label>
          <textarea className={`${inputCls} min-h-16`} value={form.auctionNotes} onChange={(e) => set("auctionNotes", e.target.value)} />
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={save}
            disabled={pending}
            className="display text-xs bg-gold hover:bg-gold-400 disabled:opacity-50 text-white rounded-lg px-5 py-2.5 transition-colors cursor-pointer"
          >
            {pending ? "Salvando..." : saved ? "Salvo ✓" : "Salvar alterações"}
          </button>
          <button
            onClick={handleDelete}
            disabled={pending}
            className="text-xs font-semibold text-signal-bad hover:bg-signal-bad/10 border border-signal-bad/25 rounded-lg px-4 py-2.5 transition-colors cursor-pointer"
          >
            Excluir veículo
          </button>
        </div>
      </div>
    </details>
  );
}
