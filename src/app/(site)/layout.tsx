import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";
import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const wa = whatsappLink(
    settings.whatsapp,
    "Olá! Vim pelo site do Juca Carros Velhos e quero informações sobre peças.",
  );

  return (
    // A barra é fixa e transparente no topo, então o espaçamento superior fica
    // por conta de cada página — a home precisa do hero 3D sangrando por baixo.
    <div className="flex flex-col min-h-screen bg-base">
      <SiteHeader whatsappUrl={wa} />
      <div className="flex-1">{children}</div>
      <SiteFooter settings={settings} />
      <WhatsAppFloat url={wa} />
    </div>
  );
}
