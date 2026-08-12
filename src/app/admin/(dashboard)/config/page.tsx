import { getSettings } from "@/lib/settings";
import { updateSettings } from "@/app/admin/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Configurações" };

const inputCls =
  "w-full rounded-lg border border-white/12 bg-surface px-3 py-2 text-sm outline-none focus:border-gold";
const labelCls = "block text-xs font-semibold text-white/60 mb-1";

export default async function ConfigPage() {
  const s = await getSettings();

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="display text-2xl text-white">Configurações da loja</h1>
        <p className="text-sm text-white/40">
          Contatos, redes sociais e textos que aparecem no site público.
        </p>
      </div>

      <form action={updateSettings} className="bg-surface rounded-2xl shadow-card p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Nome da loja</label>
            <input name="storeName" defaultValue={s.storeName} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>WhatsApp principal (com DDD)</label>
            <input name="whatsapp" defaultValue={s.whatsapp} className={inputCls} placeholder="5514998664187" />
          </div>
          <div>
            <label className={labelCls}>Telefone 2</label>
            <input name="phone2" defaultValue={s.phone2} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Facebook (URL)</label>
            <input name="facebook" defaultValue={s.facebook} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Instagram (URL)</label>
            <input name="instagram" defaultValue={s.instagram ?? ""} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>TikTok (URL)</label>
            <input name="tiktok" defaultValue={s.tiktok ?? ""} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Loja no Mercado Livre (URL)</label>
            <input name="mercadoLivre" defaultValue={s.mercadoLivre ?? ""} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Endereço</label>
            <input name="address" defaultValue={s.address} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Cidade/UF</label>
            <input name="city" defaultValue={s.city} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Link do Google Maps</label>
            <input name="mapsUrl" defaultValue={s.mapsUrl} className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Slogan (hero da home)</label>
          <input name="tagline" defaultValue={s.tagline} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Texto “sobre” (home e página Sobre)</label>
          <textarea name="about" defaultValue={s.about} className={`${inputCls} min-h-28`} />
        </div>
        <button className="display text-sm bg-gold hover:bg-gold-400 text-base rounded-xl px-6 py-3 shadow-card transition-colors cursor-pointer">
          Salvar configurações
        </button>
      </form>
    </div>
  );
}
