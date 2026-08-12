// Logotipo oficial do Desmonte Juca Carros Velhos.
// Arquivo em public/logo-juca.png — gerado a partir do original enviado pelo
// cliente (logo_juca.png), recortado e otimizado. Usa <img> em vez de
// next/image porque a imagem é estática e o servidor de produção roda o
// build standalone, sem o otimizador de imagens.
export function JucaLogo({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-juca.png"
      alt="Desmonte Juca Carros Velhos"
      width={640}
      height={502}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={className}
    />
  );
}
