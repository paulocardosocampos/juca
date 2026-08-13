import type { Metadata } from "next";
import { Archivo, Archivo_Black } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin"],
});

// Endereço público do site. Sem isto o Next monta as URLs absolutas de
// og:image com "http://localhost:3000" e o preview do link não carrega no
// WhatsApp nem nas redes. Reaproveita AUTH_URL, que já existe na stack.
const siteUrl =
  process.env.SITE_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Juca Carros Velhos — Desmanche legalizado DETRAN | Bariri/SP",
    template: "%s | Juca Carros Velhos",
  },
  description:
    "Desmanche legalizado pelo DETRAN em Bariri/SP. Peças usadas com procedência: motor, câmbio, lataria, faróis e muito mais. Compra, venda ou troca.",
  openGraph: {
    title: "Juca Carros Velhos — Desmanche legalizado DETRAN",
    description:
      "Peças usadas com procedência, direto do pátio em Bariri/SP. Compra, venda ou troca.",
    locale: "pt_BR",
    type: "website",
  },
};

// A barra do navegador acompanha o fundo do site em vez de destoar em branco.
export const viewport = {
  themeColor: "#05131f",
  colorScheme: "dark" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${archivo.variable} ${archivoBlack.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
