"use client";

import dynamic from "next/dynamic";
import type { GroupStock } from "./exploded-view";

// O canvas WebGL só existe no navegador — sem isso o build de produção
// tenta renderizar three.js no servidor.
const ExplodedView = dynamic(
  () => import("./exploded-view").then((m) => m.ExplodedView),
  {
    ssr: false,
    loading: () => (
      <div className="exp-shell">
        <div className="exp-sticky" />
      </div>
    ),
  },
);

export function ExplodedViewClient(props: {
  stock?: Record<string, GroupStock>;
  initialModel?: string;
}) {
  return <ExplodedView {...props} />;
}
