"use client";

import { useMemo, useState, useTransition } from "react";
import {
  addCustomPart,
  bulkGroupStatus,
  deletePart,
  setPartPhotos,
  setPartStatus,
  updatePart,
} from "@/app/admin/actions";
import { PART_GROUPS, PART_STATUS, type PartStatus } from "@/lib/constants";
import { PhotoUploader } from "./photo-uploader";

export interface PartData {
  id: string;
  name: string;
  group: string;
  quantity: number;
  status: string;
  price: number | null;
  soldPrice: number | null;
  description: string | null;
  mlLink: string | null;
  featured: boolean;
  photos: string[];
}

const inputCls =
  "rounded-lg border border-white/12 bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-gold";

const STATUS_ORDER: PartStatus[] = ["AVALIAR", "DISPONIVEL", "VENDIDA", "SUCATA", "DESCARTE"];

function StatusButton({
  status,
  active,
  onClick,
  disabled,
}: {
  status: PartStatus;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  const meta = PART_STATUS[status];
  return (
    <button
      type="button"
      title={meta.label}
      disabled={disabled}
      onClick={onClick}
      className={`text-[11px] font-bold rounded-md px-2 py-1 transition-all cursor-pointer disabled:opacity-40 ${
        active
          ? `${meta.color} ring-1 ring-white/25`
          : "bg-surface border border-white/12 text-white/30 hover:text-white"
      }`}
    >
      {status === "AVALIAR" && "?"}
      {status === "DISPONIVEL" && "À venda"}
      {status === "VENDIDA" && "Vendida"}
      {status === "SUCATA" && "Sucata"}
      {status === "DESCARTE" && "Descarte"}
    </button>
  );
}

function PartRow({ part }: { part: PartData }) {
  const [pending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [sellValue, setSellValue] = useState(part.price?.toString() ?? "");
  const [detail, setDetail] = useState({
    description: part.description ?? "",
    mlLink: part.mlLink ?? "",
  });
  const meta = PART_STATUS[(part.status as PartStatus) in PART_STATUS ? (part.status as PartStatus) : "AVALIAR"];

  function changeStatus(status: PartStatus) {
    if (status === "VENDIDA") {
      setSellOpen(true);
      setExpanded(true);
      return;
    }
    setSellOpen(false);
    startTransition(() => setPartStatus(part.id, status));
  }

  function confirmSale() {
    startTransition(async () => {
      await setPartStatus(part.id, "VENDIDA", sellValue ? Number(sellValue) : null);
      setSellOpen(false);
    });
  }

  function savePrice(value: string) {
    const price = value ? Number(value) : null;
    if (price === part.price) return;
    startTransition(() => updatePart(part.id, { price }));
  }

  function saveDetails() {
    startTransition(() =>
      updatePart(part.id, {
        description: detail.description,
        mlLink: detail.mlLink,
      }),
    );
  }

  return (
    <li className={`px-4 py-2.5 ${pending ? "opacity-50" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} aria-hidden />
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex-1 min-w-40 text-left text-sm font-medium text-white hover:text-gold cursor-pointer"
        >
          {part.name}
          {part.quantity > 1 && (
            <span className="ml-1.5 text-xs text-white/35">×{part.quantity}</span>
          )}
          {part.featured && <span title="Destaque na vitrine"> ⭐</span>}
          {part.photos.length > 0 && (
            <span className="ml-1.5 text-xs text-white/30">📷{part.photos.length}</span>
          )}
        </button>

        {part.status === "DISPONIVEL" && (
          <div className="flex items-center gap-1 text-xs text-white/60">
            R$
            <input
              type="number"
              min="0"
              step="0.01"
              defaultValue={part.price ?? ""}
              onBlur={(e) => savePrice(e.target.value)}
              placeholder="preço"
              className={`${inputCls} w-24`}
            />
          </div>
        )}
        {part.status === "VENDIDA" && part.soldPrice != null && (
          <span className="text-xs font-semibold text-signal-info">
            vendida por R$ {part.soldPrice.toLocaleString("pt-BR")}
          </span>
        )}

        <div className="flex gap-1">
          {STATUS_ORDER.map((s) => (
            <StatusButton
              key={s}
              status={s}
              active={part.status === s}
              disabled={pending}
              onClick={() => changeStatus(s)}
            />
          ))}
        </div>
      </div>

      {expanded && (
        <div className="mt-3 ml-4 rounded-xl bg-base border border-white/8 p-4 space-y-3">
          {sellOpen && (
            <div className="flex items-center gap-2 bg-signal-info/10 border border-signal-info/25 rounded-lg px-3 py-2">
              <span className="text-xs font-semibold text-signal-info">Valor da venda: R$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={sellValue}
                onChange={(e) => setSellValue(e.target.value)}
                className={`${inputCls} w-28`}
                autoFocus
              />
              <button
                onClick={confirmSale}
                disabled={pending}
                className="text-xs font-bold bg-signal-info hover:brightness-110 text-base rounded-lg px-3 py-1.5 cursor-pointer disabled:opacity-50"
              >
                Confirmar venda
              </button>
              <button
                onClick={() => setSellOpen(false)}
                className="text-xs text-white/60 cursor-pointer"
              >
                cancelar
              </button>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1">
                Descrição (aparece na loja)
              </label>
              <textarea
                value={detail.description}
                onChange={(e) => setDetail((d) => ({ ...d, description: e.target.value }))}
                className={`${inputCls} w-full min-h-16`}
                placeholder="Estado da peça, detalhes, compatibilidade..."
              />
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">
                  Link do anúncio no Mercado Livre
                </label>
                <input
                  value={detail.mlLink}
                  onChange={(e) => setDetail((d) => ({ ...d, mlLink: e.target.value }))}
                  className={`${inputCls} w-full`}
                  placeholder="https://produto.mercadolivre.com.br/..."
                />
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-white/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={part.featured}
                  disabled={part.status !== "DISPONIVEL" || pending}
                  onChange={(e) =>
                    startTransition(() => updatePart(part.id, { featured: e.target.checked }))
                  }
                  className="accent-gold"
                />
                ⭐ Destacar na vitrine (só peças à venda)
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-1">Fotos da peça</label>
            <PhotoUploader
              photos={part.photos}
              saveAction={setPartPhotos.bind(null, part.id)}
              compact
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={saveDetails}
              disabled={pending}
              className="text-xs font-bold bg-gold hover:bg-gold-400 text-base rounded-lg px-4 py-2 cursor-pointer disabled:opacity-50"
            >
              Salvar detalhes
            </button>
            <button
              onClick={() => {
                if (confirm(`Remover a peça "${part.name}" deste veículo?`))
                  startTransition(() => deletePart(part.id));
              }}
              className="text-xs text-signal-bad hover:underline cursor-pointer"
            >
              remover peça
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

function GroupSection({
  group,
  parts,
  vehicleId,
}: {
  group: string;
  parts: PartData[];
  vehicleId: string;
}) {
  const [pending, startTransition] = useTransition();
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of parts) c[p.status] = (c[p.status] ?? 0) + 1;
    return c;
  }, [parts]);

  function bulk(status: string) {
    if (!status) return;
    const label = PART_STATUS[status as PartStatus]?.label ?? status;
    if (!confirm(`Marcar TODAS as peças de "${group}" (exceto vendidas) como "${label}"?`)) return;
    startTransition(() => bulkGroupStatus(vehicleId, group, status));
  }

  return (
    <section className="bg-surface rounded-2xl shadow-card overflow-hidden">
      <header className="flex flex-wrap items-center gap-3 px-4 py-3 bg-raised border-b border-white/8">
        <h3 className="display text-xs text-white flex-1">{group}</h3>
        <div className="flex gap-2 text-[11px] text-white/40">
          {STATUS_ORDER.filter((s) => counts[s]).map((s) => (
            <span key={s} className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${PART_STATUS[s].dot}`} />
              {counts[s]}
            </span>
          ))}
        </div>
        <select
          defaultValue=""
          disabled={pending}
          onChange={(e) => {
            bulk(e.target.value);
            e.target.value = "";
          }}
          className="text-xs rounded-lg border border-white/12 bg-surface px-2 py-1.5 cursor-pointer"
        >
          <option value="">Marcar grupo como...</option>
          <option value="DISPONIVEL">À venda</option>
          <option value="SUCATA">Sucata</option>
          <option value="DESCARTE">Descarte</option>
          <option value="AVALIAR">Avaliar</option>
        </select>
      </header>
      <ul className="divide-y divide-white/8">
        {parts.map((p) => (
          <PartRow key={p.id} part={p} />
        ))}
      </ul>
    </section>
  );
}

export function PartsChecklist({
  vehicleId,
  parts,
}: {
  vehicleId: string;
  parts: PartData[];
}) {
  const [filter, setFilter] = useState<string>("TODAS");
  const [query, setQuery] = useState("");
  const [addPending, startAdd] = useTransition();
  const [newName, setNewName] = useState("");
  const [newGroup, setNewGroup] = useState<string>(PART_GROUPS[0]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return parts.filter(
      (p) =>
        (filter === "TODAS" || p.status === filter) &&
        (!q || p.name.toLowerCase().includes(q)),
    );
  }, [parts, filter, query]);

  const groups = useMemo(() => {
    const map = new Map<string, PartData[]>();
    const order = [...PART_GROUPS] as string[];
    for (const p of filtered) {
      if (!map.has(p.group)) map.set(p.group, []);
      map.get(p.group)!.push(p);
    }
    return [...map.entries()].sort(
      (a, b) => order.indexOf(a[0]) - order.indexOf(b[0]),
    );
  }, [filtered]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { TODAS: parts.length };
    for (const p of parts) c[p.status] = (c[p.status] ?? 0) + 1;
    return c;
  }, [parts]);

  function addPart() {
    if (!newName.trim()) return;
    startAdd(async () => {
      await addCustomPart(vehicleId, newName, newGroup);
      setNewName("");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["TODAS", ...STATUS_ORDER] as string[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs font-bold rounded-full px-3 py-1.5 transition-colors cursor-pointer ${
              filter === s
                ? "bg-surface text-white"
                : "bg-surface border border-white/12 text-white/60 hover:border-white/12"
            }`}
          >
            {s === "TODAS" ? "Todas" : PART_STATUS[s as PartStatus].label}
            <span className="ml-1 opacity-60">({counts[s] ?? 0})</span>
          </button>
        ))}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar peça..."
          className={`${inputCls} ml-auto w-48`}
        />
      </div>

      {groups.map(([group, groupParts]) => (
        <GroupSection key={group} group={group} parts={groupParts} vehicleId={vehicleId} />
      ))}
      {groups.length === 0 && (
        <div className="bg-surface rounded-2xl shadow-card p-8 text-center text-sm text-white/35">
          Nenhuma peça encontrada com esse filtro.
        </div>
      )}

      <div className="bg-surface rounded-2xl shadow-card p-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-48">
          <label className="block text-xs font-semibold text-white/60 mb-1">
            Adicionar peça extra
          </label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome da peça..."
            className={`${inputCls} w-full`}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/60 mb-1">Grupo</label>
          <select
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            className={`${inputCls} cursor-pointer`}
          >
            {PART_GROUPS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>
        <button
          onClick={addPart}
          disabled={addPending || !newName.trim()}
          className="display text-xs bg-gold hover:bg-gold-400 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 cursor-pointer"
        >
          + Adicionar
        </button>
      </div>
    </div>
  );
}
