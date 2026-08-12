"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createVehicle, type CreateVehicleInput } from "@/app/admin/actions";
import { generatePartsChecklist } from "@/lib/part-generator";
import {
  BODY_TYPES,
  TRANSMISSIONS,
  type BodyType,
  type Transmission,
} from "@/lib/constants";

interface Ref {
  codigo: string;
  nome: string;
}

interface FipeResult {
  fipe: {
    brand: string;
    model: string;
    modelYear: number;
    fuel: string;
    fipeCode: string;
    fipeValue: number | null;
    reference: string;
  };
  parsed: {
    doors: number;
    engine: string | null;
    body: BodyType;
    transmission: Transmission;
  };
  engineFamily: string | null;
}

const inputCls =
  "w-full rounded-lg border border-white/12 bg-surface px-3 py-2 text-sm outline-none focus:border-gold";
const labelCls = "block text-xs font-semibold text-white/60 mb-1";

export function VehicleWizard() {
  const [manual, setManual] = useState(false);
  const [brands, setBrands] = useState<Ref[]>([]);
  const [models, setModels] = useState<Ref[]>([]);
  const [years, setYears] = useState<Ref[]>([]);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [fipeError, setFipeError] = useState<string | null>(null);
  const [result, setResult] = useState<FipeResult | null>(null);

  // Campos editáveis (pré-preenchidos pela FIPE ou manuais)
  const [form, setForm] = useState({
    brand: "",
    model: "",
    modelYear: new Date().getFullYear(),
    fuel: "",
    fipeCode: "",
    fipeValue: null as number | null,
    doors: 4,
    body: "HATCH" as BodyType,
    transmission: "MANUAL" as Transmission,
    engine: "",
    engineFamily: "",
    color: "",
    auctioneer: "",
    auctionName: "",
    lotNumber: "",
    auctionDate: "",
    purchaseValue: "",
    auctionNotes: "",
  });
  const set = (k: keyof typeof form, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));

  const [submitting, startSubmit] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setLoading("marcas");
    fetch("/api/fipe/brands")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setBrands)
      .catch(() => setFipeError("Não consegui carregar as marcas da FIPE. Você pode cadastrar manualmente."))
      .finally(() => setLoading(null));
  }, []);

  useEffect(() => {
    if (!brand) return;
    setModels([]);
    setYears([]);
    setModel("");
    setYear("");
    setLoading("modelos");
    fetch(`/api/fipe/models?brand=${brand}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setModels)
      .catch(() => setFipeError("Falha ao carregar modelos da FIPE."))
      .finally(() => setLoading(null));
  }, [brand]);

  useEffect(() => {
    if (!brand || !model) return;
    setYears([]);
    setYear("");
    setLoading("anos");
    fetch(`/api/fipe/years?brand=${brand}&model=${model}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setYears)
      .catch(() => setFipeError("Falha ao carregar anos da FIPE."))
      .finally(() => setLoading(null));
  }, [brand, model]);

  useEffect(() => {
    if (!brand || !model || !year) return;
    setLoading("veiculo");
    setFipeError(null);
    fetch(`/api/fipe/vehicle?brand=${brand}&model=${model}&year=${year}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: FipeResult) => {
        setResult(data);
        setForm((f) => ({
          ...f,
          brand: data.fipe.brand,
          model: data.fipe.model,
          modelYear: data.fipe.modelYear,
          fuel: data.fipe.fuel,
          fipeCode: data.fipe.fipeCode,
          fipeValue: data.fipe.fipeValue,
          doors: data.parsed.doors,
          body: data.parsed.body,
          transmission: data.parsed.transmission,
          engine: data.parsed.engine ?? "",
          engineFamily: data.engineFamily ?? "",
        }));
      })
      .catch(() => setFipeError("Falha ao consultar o veículo na FIPE."))
      .finally(() => setLoading(null));
  }, [brand, model, year]);

  const filteredModels = useMemo(() => {
    const f = modelFilter.trim().toLowerCase();
    return f ? models.filter((m) => m.nome.toLowerCase().includes(f)) : models;
  }, [models, modelFilter]);

  const partsPreview = useMemo(
    () =>
      generatePartsChecklist({
        doors: form.doors,
        body: form.body,
        transmission: form.transmission,
      }),
    [form.doors, form.body, form.transmission],
  );

  const ready = manual
    ? form.brand.trim() && form.model.trim() && form.modelYear > 1940
    : !!result;

  function submit() {
    setSubmitError(null);
    const payload: CreateVehicleInput = {
      brand: form.brand,
      model: form.model,
      modelYear: Number(form.modelYear),
      fuel: form.fuel || null,
      fipeCode: form.fipeCode || null,
      fipeValue: form.fipeValue,
      doors: Number(form.doors),
      body: form.body,
      transmission: form.transmission,
      engine: form.engine || null,
      engineFamily: form.engineFamily || null,
      color: form.color || null,
      auctioneer: form.auctioneer || null,
      auctionName: form.auctionName || null,
      lotNumber: form.lotNumber || null,
      auctionDate: form.auctionDate || null,
      purchaseValue: form.purchaseValue ? Number(form.purchaseValue) : null,
      auctionNotes: form.auctionNotes || null,
    };
    startSubmit(async () => {
      try {
        await createVehicle(payload);
      } catch (e) {
        // redirect() lança um erro especial do Next — não tratar como falha
        if (e && typeof e === "object" && "digest" in e) throw e;
        setSubmitError("Não foi possível salvar o veículo. Tente novamente.");
      }
    });
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Passo 1 — identificação */}
      <section className="bg-surface rounded-2xl shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="display text-sm text-white">1 · Identificação do veículo</h2>
          <label className="flex items-center gap-2 text-xs font-semibold text-white/60 cursor-pointer">
            <input
              type="checkbox"
              checked={manual}
              onChange={(e) => setManual(e.target.checked)}
              className="accent-gold"
            />
            Cadastrar manualmente (sem FIPE)
          </label>
        </div>

        {!manual ? (
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Marca {loading === "marcas" && "· carregando..."}</label>
              <select
                className={inputCls}
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              >
                <option value="">Selecione...</option>
                {brands.map((b) => (
                  <option key={b.codigo} value={b.codigo}>
                    {b.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Modelo {loading === "modelos" && "· carregando..."}</label>
              <input
                className={`${inputCls} mb-1.5`}
                placeholder="Filtrar modelos... ex.: corsa 1.8"
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                disabled={!models.length}
              />
              <select
                className={inputCls}
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={!models.length}
              >
                <option value="">Selecione...</option>
                {filteredModels.map((m) => (
                  <option key={m.codigo} value={m.codigo}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Ano / combustível {loading === "anos" && "· carregando..."}</label>
              <select
                className={inputCls}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                disabled={!years.length}
              >
                <option value="">Selecione...</option>
                {years.map((y) => (
                  <option key={y.codigo} value={y.codigo}>
                    {y.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Marca</label>
              <input
                className={inputCls}
                value={form.brand}
                onChange={(e) => set("brand", e.target.value)}
                placeholder="Ex.: Chevrolet"
              />
            </div>
            <div>
              <label className={labelCls}>Modelo / versão</label>
              <input
                className={inputCls}
                value={form.model}
                onChange={(e) => set("model", e.target.value)}
                placeholder="Ex.: Corsa Sedan 1.8 8V"
              />
            </div>
            <div>
              <label className={labelCls}>Ano-modelo</label>
              <input
                type="number"
                className={inputCls}
                value={form.modelYear}
                onChange={(e) => set("modelYear", Number(e.target.value))}
              />
            </div>
          </div>
        )}

        {loading === "veiculo" && (
          <p className="text-sm text-white/60 animate-pulse">Consultando FIPE...</p>
        )}
        {fipeError && <p className="text-sm text-signal-bad">{fipeError}</p>}

        {result && !manual && (
          <div className="rounded-xl bg-signal-ok/10 border border-signal-ok/25 px-4 py-3 text-sm text-signal-ok">
            <b>
              {result.fipe.brand} {result.fipe.model} {result.fipe.modelYear}
            </b>{" "}
            · {result.fipe.fuel} · código FIPE {result.fipe.fipeCode}
            {result.fipe.fipeValue != null && (
              <> · tabela {result.fipe.fipeValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</>
            )}
            <span className="block text-xs mt-0.5 text-signal-ok">
              Referência {result.fipe.reference}. Atributos detectados automaticamente — confira abaixo.
            </span>
          </div>
        )}
      </section>

      {/* Passo 2 — atributos técnicos */}
      <section className="bg-surface rounded-2xl shadow-card p-6 space-y-4">
        <h2 className="display text-sm text-white">2 · Características (geram o checklist de peças)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className={labelCls}>Portas</label>
            <select
              className={inputCls}
              value={form.doors}
              onChange={(e) => set("doors", Number(e.target.value))}
            >
              <option value={2}>2 portas</option>
              <option value={4}>4 portas</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Carroceria</label>
            <select
              className={inputCls}
              value={form.body}
              onChange={(e) => set("body", e.target.value as BodyType)}
            >
              {BODY_TYPES.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Câmbio</label>
            <select
              className={inputCls}
              value={form.transmission}
              onChange={(e) => set("transmission", e.target.value as Transmission)}
            >
              {TRANSMISSIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Motor</label>
            <input
              className={inputCls}
              value={form.engine}
              onChange={(e) => set("engine", e.target.value)}
              placeholder="1.8 8V"
            />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Família do motor (sugerida)</label>
            <input
              className={inputCls}
              value={form.engineFamily}
              onChange={(e) => set("engineFamily", e.target.value)}
              placeholder="Ex.: Fire, AP, EA111, VHC..."
            />
          </div>
          <div>
            <label className={labelCls}>Cor</label>
            <input
              className={inputCls}
              value={form.color}
              onChange={(e) => set("color", e.target.value)}
              placeholder="Prata"
            />
          </div>
        </div>
        <p className="text-xs rounded-lg bg-base border border-white/8 px-3 py-2 text-white/60">
          🔧 Com essas características serão geradas automaticamente{" "}
          <b className="text-gold">{partsPreview.length} peças</b> no checklist do veículo.
        </p>
      </section>

      {/* Passo 3 — dados do leilão (privados) */}
      <section className="bg-surface rounded-2xl shadow-card p-6 space-y-4">
        <h2 className="display text-sm text-white">
          3 · Dados do leilão{" "}
          <span className="text-xs font-normal normal-case text-white/35">
            (privados — nunca aparecem na loja)
          </span>
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Leiloeiro</label>
            <input
              className={inputCls}
              value={form.auctioneer}
              onChange={(e) => set("auctioneer", e.target.value)}
              placeholder="Ex.: Sodré Santoro"
            />
          </div>
          <div>
            <label className={labelCls}>Leilão / edital</label>
            <input
              className={inputCls}
              value={form.auctionName}
              onChange={(e) => set("auctionName", e.target.value)}
              placeholder="Ex.: DETRAN-SP Jaú 12/2026"
            />
          </div>
          <div>
            <label className={labelCls}>Nº do lote</label>
            <input
              className={inputCls}
              value={form.lotNumber}
              onChange={(e) => set("lotNumber", e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Data do arremate</label>
            <input
              type="date"
              className={inputCls}
              value={form.auctionDate}
              onChange={(e) => set("auctionDate", e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Valor do arremate (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={inputCls}
              value={form.purchaseValue}
              onChange={(e) => set("purchaseValue", e.target.value)}
            />
          </div>
          <div className="sm:col-span-3">
            <label className={labelCls}>Observações</label>
            <textarea
              className={`${inputCls} min-h-20`}
              value={form.auctionNotes}
              onChange={(e) => set("auctionNotes", e.target.value)}
              placeholder="Estado do veículo, avarias, pendências..."
            />
          </div>
        </div>
      </section>

      {submitError && <p className="text-sm text-signal-bad">{submitError}</p>}

      <button
        onClick={submit}
        disabled={!ready || submitting}
        className="display text-sm bg-gold hover:bg-gold-400 disabled:opacity-50 text-white rounded-xl px-6 py-4 shadow-card transition-colors cursor-pointer"
      >
        {submitting
          ? "Salvando e gerando peças..."
          : `Salvar veículo e gerar ${partsPreview.length} peças`}
      </button>
    </div>
  );
}
