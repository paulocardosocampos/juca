// Marca compacta: silhueta de guincho reduzida ao essencial, legível a 20px.
// É esta versão que aparece no site — o mascote ilustrado ficou reservado para
// materiais impressos e para a assinatura do rodapé.
export function JucaMark({
  className = "",
  title = "Juca Carros Velhos",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg viewBox="0 0 48 34" className={className} role="img" aria-label={title}>
      <g fill="currentColor">
        {/* lança do guincho */}
        <path d="M30.5 10.6 43.2 2.1a1.5 1.5 0 0 1 1.7 2.5l-12.7 8.5z" />
        <rect x="43" y="3.4" width="2.4" height="8.4" rx="1.2" />
        <path d="M44.2 12.2c2 0 3.2 1.6 2.7 3.3-.45 1.5-2.2 2.2-3.6 1.5l.9-1.9c.6.2 1.1-.1 1.2-.6.1-.6-.4-1-1.5-1z" />
        {/* cabine */}
        <rect x="6" y="6" width="26" height="17" rx="4.5" />
        {/* espelhos */}
        <rect x="1.5" y="8.6" width="3.6" height="5.4" rx="1.6" />
        <rect x="33" y="8.6" width="3.6" height="5.4" rx="1.6" />
        {/* rodas */}
        <circle cx="13" cy="27.5" r="5.4" />
        <circle cx="27" cy="27.5" r="5.4" />
      </g>
      {/* para-brisa vazado: dá leitura de "veículo" mesmo em tamanho mínimo */}
      <rect x="9.5" y="9" width="19" height="7.6" rx="2.4" fill="#000" opacity="0.55" />
    </svg>
  );
}

// Mascote do Juca Carros Velhos: um guincho retrô enferrujado e sorridente.
// Ilustração SVG original (inspiração livre no arquétipo de "guincho
// simpático", com traço, cores e proporções próprios).
export function JucaMascot({
  className = "",
  title = "Mascote Juca Carros Velhos",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 220 200"
      className={className}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id="jm-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#df8a48" />
          <stop offset="0.55" stopColor="#cd6d29" />
          <stop offset="1" stopColor="#b5541c" />
        </linearGradient>
        <linearGradient id="jm-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdf8ee" />
          <stop offset="1" stopColor="#f1e6cf" />
        </linearGradient>
      </defs>

      {/* Lança do guincho + gancho, atrás da cabine */}
      <g stroke="#612c15" strokeLinecap="round">
        <line x1="148" y1="46" x2="188" y2="14" strokeWidth="9" />
        <line x1="188" y1="16" x2="188" y2="48" strokeWidth="3.5" />
      </g>
      <path
        d="M188 48 c8 0 12 6 10 12 c-1.6 4.8 -7 7 -11.5 5.2 l3 -5.4 c2 0.6 3.8 -0.4 4.2 -2.2 c0.5 -2.2 -1.5 -4 -5.7 -3.6 z"
        fill="#4a4036"
      />

      {/* Espelhos (orelhas) */}
      <g stroke="#944118" strokeWidth="5" strokeLinecap="round">
        <line x1="38" y1="64" x2="22" y2="52" />
        <line x1="182" y1="64" x2="198" y2="52" />
      </g>
      <rect x="10" y="36" width="17" height="22" rx="5" fill="#b5541c" />
      <rect x="193" y="36" width="17" height="22" rx="5" fill="#b5541c" />

      {/* Giroflex no teto */}
      <rect x="92" y="20" width="36" height="10" rx="4" fill="#4a4036" />
      <path d="M100 22 a10 10 0 0 1 20 0 z" fill="#f4c14e" />

      {/* Cabine */}
      <rect x="32" y="30" width="156" height="126" rx="22" fill="url(#jm-body)" />
      {/* Manchas de ferrugem */}
      <path
        d="M40 132 q8 -10 18 -4 q10 5 4 14 q-8 10 -18 4 q-9 -6 -4 -14 z"
        fill="#773517"
        opacity="0.55"
      />
      <path
        d="M168 40 q10 -4 14 6 q3 9 -6 12 q-10 3 -13 -5 q-3 -9 5 -13 z"
        fill="#773517"
        opacity="0.5"
      />
      <path d="M32 96 h156 v6 H32 z" fill="#944118" opacity="0.35" />

      {/* Para-brisa com olhos */}
      <rect
        x="48"
        y="44"
        width="124"
        height="56"
        rx="14"
        fill="url(#jm-glass)"
        stroke="#773517"
        strokeWidth="4"
      />
      <g>
        <circle cx="85" cy="72" r="14" fill="#ffffff" stroke="#26201a" strokeWidth="3" />
        <circle cx="135" cy="72" r="14" fill="#ffffff" stroke="#26201a" strokeWidth="3" />
        <circle cx="88" cy="75" r="6.5" fill="#26201a" />
        <circle cx="138" cy="75" r="6.5" fill="#26201a" />
        <circle cx="90.5" cy="72.5" r="2.2" fill="#ffffff" />
        <circle cx="140.5" cy="72.5" r="2.2" fill="#ffffff" />
        {/* Pálpebras caídas de simpático */}
        <path d="M71 63 a14 14 0 0 1 28 0 z" fill="#cd6d29" opacity="0.9" />
        <path d="M121 63 a14 14 0 0 1 28 0 z" fill="#cd6d29" opacity="0.9" />
      </g>

      {/* Faróis */}
      <circle cx="52" cy="122" r="11" fill="#f4c14e" stroke="#944118" strokeWidth="3" />
      <circle cx="168" cy="122" r="11" fill="#f4c14e" stroke="#944118" strokeWidth="3" />
      <circle cx="49" cy="119" r="3.5" fill="#fdf8ee" />
      <circle cx="165" cy="119" r="3.5" fill="#fdf8ee" />

      {/* Boca sorridente com dentão */}
      <path
        d="M74 116 q36 30 72 0 q-14 34 -36 34 q-22 0 -36 -34 z"
        fill="#3a180a"
      />
      <path
        d="M74 116 q36 30 72 0"
        fill="none"
        stroke="#612c15"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="102" y="126" width="15" height="15" rx="3" fill="#fdf8ee" stroke="#26201a" strokeWidth="2.5" />

      {/* Para-choque */}
      <rect x="36" y="150" width="148" height="17" rx="8.5" fill="#b8b2a6" />
      <rect x="36" y="150" width="148" height="7" rx="3.5" fill="#d8d2c4" />

      {/* Rodas */}
      <circle cx="62" cy="172" r="24" fill="#26201a" />
      <circle cx="158" cy="172" r="24" fill="#26201a" />
      <circle cx="62" cy="172" r="10" fill="#f1e6cf" />
      <circle cx="158" cy="172" r="10" fill="#f1e6cf" />
      <circle cx="62" cy="172" r="4" fill="#944118" />
      <circle cx="158" cy="172" r="4" fill="#944118" />
    </svg>
  );
}

// Versão monocromática (silhueta) — usada em placeholders de foto.
export function JucaMascotGhost({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 200" className={className} aria-hidden="true">
      <g fill="currentColor">
        <rect x="32" y="30" width="156" height="126" rx="22" />
        <rect x="10" y="36" width="17" height="22" rx="5" />
        <rect x="193" y="36" width="17" height="22" rx="5" />
        <rect x="92" y="16" width="36" height="14" rx="5" />
        <circle cx="62" cy="172" r="24" />
        <circle cx="158" cy="172" r="24" />
        <path d="M148 46 l40 -32 l6 8 l-40 32 z" />
        <rect x="184" y="18" width="7" height="34" rx="3" />
      </g>
      <rect x="48" y="44" width="124" height="56" rx="14" fill="#fff" opacity="0.35" />
      <path d="M74 116 q36 30 72 0 q-14 34 -36 34 q-22 0 -36 -34 z" fill="#fff" opacity="0.35" />
    </svg>
  );
}
