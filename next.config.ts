import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera um servidor autocontido em .next/standalone — é o que a imagem
  // Docker executa, sem precisar de node_modules completo em produção.
  output: "standalone",

  // Os nomes dos arquivos enviados são UUID, então o conteúdo de um caminho
  // nunca muda: vale cachear no navegador. Sem isto o Next devolve
  // "max-age=0" e as fotos são rebaixadas a cada visita.
  async headers() {
    return [
      {
        source: "/uploads/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      // As fotos do admin são gravadas em disco depois do build, e o Next não
      // serve arquivos novos de /public em produção. Quando o arquivo não é
      // encontrado entre os estáticos, a requisição cai nesta rota, que lê do
      // volume. Os caminhos salvos no banco continuam sendo /uploads/....
      { source: "/uploads/:path*", destination: "/api/uploads/:path*" },
    ];
  },
};

export default nextConfig;
