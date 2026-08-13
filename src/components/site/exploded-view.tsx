"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Html,
  Lightformer,
  OrbitControls,
  useGLTF,
  useProgress,
} from "@react-three/drei";
import * as THREE from "three";
import { clone as skeletonClone } from "three/examples/jsm/utils/SkeletonUtils.js";
import {
  GROUP_ACCENT,
  MODELS,
  classify,
  type ExplodedModel,
} from "@/lib/exploded-models";

export interface GroupStock {
  count: number;
  minPrice: number | null;
}

interface Part {
  name: string;
  container: THREE.Group;
  center: THREE.Vector3;
  dir: THREE.Vector3;
  dist: number;
}

/* ------------------------------------------------------------------ */
/* Montagem: reagrupa as malhas do glTF nos grupos de peça do sistema  */
/* ------------------------------------------------------------------ */

function useAssembly(model: ExplodedModel) {
  // Draco desligado de propósito: o drei baixaria o decodificador de um CDN do
  // Google. Os modelos usam meshopt, cujo decodificador vem empacotado no
  // three-stdlib — a página não depende de rede externa para abrir.
  const { scene } = useGLTF(model.url, false);

  return useMemo(() => {
    const source = skeletonClone(scene) as THREE.Object3D;
    const inner = new THREE.Group();
    inner.add(source);
    inner.updateMatrixWorld(true);

    // Normaliza: centraliza na origem e mede para caber em ~4 unidades.
    const box = new THREE.Box3().setFromObject(source);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    source.position.sub(center);
    inner.updateMatrixWorld(true);

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const fit = 4 / maxDim;

    // Explode menos no eixo do comprimento do carro — senão a peça
    // dianteira e a traseira somem da tela antes das laterais abrirem.
    const weight = new THREE.Vector3(1.45, 1.5, 1.45);
    if (size.x >= size.y && size.x >= size.z) weight.x = 0.55;
    else if (size.y >= size.z) weight.y = 0.55;
    else weight.z = 0.55;

    const byGroup = new Map<string, THREE.Mesh[]>();
    source.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const g = classify(m.name, model.rules);
      const list = byGroup.get(g);
      if (list) list.push(m);
      else byGroup.set(g, [m]);
    });

    const parts: Part[] = [];
    for (const [name, meshes] of byGroup) {
      const container = new THREE.Group();
      container.name = name;
      inner.add(container);
      // attach() preserva a transformação de mundo ao reparentar.
      for (const m of meshes) {
        container.attach(m);
        // Material próprio por peça: o hover não pode acender o carro inteiro.
        m.material = Array.isArray(m.material)
          ? m.material.map((x) => x.clone())
          : m.material.clone();
      }
      container.updateMatrixWorld(true);

      const gc = new THREE.Box3()
        .setFromObject(container)
        .getCenter(new THREE.Vector3());

      const dir = gc.clone().multiply(weight);
      if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0);
      dir.normalize();

      parts.push({ name, container, center: gc, dir, dist: model.spread * maxDim });
    }

    // Peças maiores primeiro: a lataria abre e revela o resto.
    parts.sort((a, b) => b.container.children.length - a.container.children.length);
    return { parts, fit };
  }, [scene, model]);
}

/* ------------------------------------------------------------------ */

function Assembly({
  model,
  progress,
  stock,
  hovered,
  setHovered,
  onParts,
}: {
  model: ExplodedModel;
  progress: React.RefObject<number>;
  stock: Record<string, GroupStock>;
  hovered: string | null;
  setHovered: (v: string | null) => void;
  onParts: (names: string[]) => void;
}) {
  const router = useRouter();
  const { parts, fit } = useAssembly(model);
  const refs = useRef<Record<string, THREE.Group | null>>({});
  const labelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rootRef = useRef<THREE.Group>(null);
  const probe = useRef(new THREE.Vector3());
  const eased = useRef(0);
  // Girar o carro é arrastar. Sem isso, todo arrasto vira clique e o
  // visitante é jogado para fora da página no meio da experiência.
  const down = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    onParts(parts.map((p) => p.name));
  }, [parts, onParts]);

  // Guarda a cor original para restaurar ao sair do hover.
  useEffect(() => {
    for (const p of parts) {
      p.container.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        const mat = m.material as THREE.MeshStandardMaterial;
        if (mat?.emissive) mat.userData.baseEmissive = mat.emissive.getHex();
      });
    }
  }, [parts]);

  useEffect(() => {
    for (const p of parts) {
      const on = hovered === p.name;
      const accent = new THREE.Color(GROUP_ACCENT[p.name] ?? "#f0b41c");
      p.container.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        const mat = m.material as THREE.MeshStandardMaterial;
        if (!mat?.emissive) return;
        if (on) {
          // Realce discreto: a peça precisa acender sem perder o material.
          mat.emissive.copy(accent);
          mat.emissiveIntensity = 0.16;
        } else {
          mat.emissive.setHex(mat.userData.baseEmissive ?? 0x000000);
          mat.emissiveIntensity = 1;
        }
      });
    }
  }, [hovered, parts]);

  useFrame((state, delta) => {
    // Suaviza o scroll — sem isso a explosão treme junto com a roda do mouse.
    const target = progress.current ?? 0;
    eased.current += (target - eased.current) * Math.min(1, delta * 6);
    const t = eased.current;

    // Encolhe o conjunto conforme abre: equivale a afastar a câmera, mas sem
    // brigar com o OrbitControls pelo controle da posição.
    if (rootRef.current) rootRef.current.scale.setScalar(fit * (1 - 0.32 * t));

    for (const p of parts) {
      const g = refs.current[p.name];
      if (!g) continue;
      const boost = hovered === p.name ? 1.12 : 1;
      g.position.copy(p.dir).multiplyScalar(p.dist * t * boost);

      // O rótulo vira para dentro quando a peça passa da metade direita,
      // senão o texto sai pela borda da tela.
      const el = labelRefs.current[p.name];
      if (el) {
        probe.current.copy(p.center).applyMatrix4(g.matrixWorld).project(state.camera);
        el.dataset.side = probe.current.x > 0.1 ? "l" : "r";
      }
    }
  });

  return (
    <group ref={rootRef} scale={fit}>
      {parts.map((p) => {
        const st = stock[p.name];
        const accent = GROUP_ACCENT[p.name] ?? "#f0b41c";
        return (
          <group
            key={p.name}
            ref={(el) => {
              refs.current[p.name] = el;
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(p.name);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHovered(null);
              document.body.style.cursor = "auto";
            }}
            onPointerDown={(e) => {
              down.current = { x: e.clientX, y: e.clientY };
            }}
            onClick={(e) => {
              e.stopPropagation();
              const d = down.current;
              down.current = null;
              if (!d) return;
              const moved = Math.hypot(e.clientX - d.x, e.clientY - d.y);
              // Só navega em clique limpo e com o carro já aberto.
              if (moved > 6 || (progress.current ?? 0) < 0.15) return;
              router.push(`/pecas?grupo=${encodeURIComponent(p.name)}`);
            }}
          >
            <primitive object={p.container} />
            <Html
              position={p.center}
              center={false}
              zIndexRange={[40, 0]}
              style={{ pointerEvents: "none" }}
            >
              <div
                ref={(el) => {
                  labelRefs.current[p.name] = el;
                }}
                className="exp-label"
                data-side="r"
                data-vis={hovered === p.name ? "1" : "0"}
                style={{ ["--accent" as string]: accent }}
              >
                <span className="exp-dot" />
                <span className="exp-line" />
                <span className="exp-text">
                  <b>{p.name}</b>
                  {st ? (
                    <i>
                      {st.count} em estoque
                      {st.minPrice != null
                        ? ` · a partir de ${st.minPrice.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            maximumFractionDigits: 0,
                          })}`
                        : ""}
                    </i>
                  ) : (
                    <i>consultar disponibilidade</i>
                  )}
                </span>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

/* ------------------------------------------------------------------ */

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="exp-loader">
        <div className="exp-loader-bar">
          <div style={{ width: `${progress}%` }} />
        </div>
        <p>carregando geometria · {Math.round(progress)}%</p>
      </div>
    </Html>
  );
}

function Studio() {
  // Iluminação de estúdio montada com Lightformers — nenhum HDRI externo,
  // então funciona offline e não depende de CDN.
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 8, 4]} intensity={1.6} castShadow={false} />
      <directionalLight position={[-6, 3, -5]} intensity={0.7} color="#fcd427" />
      <Environment resolution={256}>
        <Lightformer intensity={3} position={[0, 6, -6]} scale={[12, 6, 1]} />
        <Lightformer intensity={2} position={[-6, 2, 2]} scale={[3, 8, 1]} color="#9fd0ff" />
        <Lightformer intensity={2.4} position={[6, 2, 2]} scale={[3, 8, 1]} color="#ffb27a" />
        <Lightformer intensity={1.4} position={[0, -4, 0]} scale={[10, 10, 1]} />
      </Environment>
      <ContactShadows
        position={[0, -1.35, 0]}
        opacity={0.55}
        scale={14}
        blur={2.6}
        far={4}
        color="#000000"
      />
    </>
  );
}

/* ------------------------------------------------------------------ */

export function ExplodedView({
  stock = {},
  initialModel = "db11",
}: {
  stock?: Record<string, GroupStock>;
  initialModel?: string;
}) {
  const [modelId, setModelId] = useState(initialModel);
  const [hovered, setHovered] = useState<string | null>(null);
  const [spin, setSpin] = useState(true);
  const [pct, setPct] = useState(0);
  const [groupNames, setGroupNames] = useState<string[]>([]);
  const handleParts = useCallback((n: string[]) => setGroupNames(n), []);
  const router = useRouter();
  const progress = useRef(0);
  const shell = useRef<HTMLDivElement>(null);

  const model = MODELS.find((m) => m.id === modelId) ?? MODELS[0];

  // O scroll dentro do bloco alto controla a explosão (0 → 1).
  useEffect(() => {
    const onScroll = () => {
      const el = shell.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      progress.current = p;
      setPct(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={shell} className="exp-shell">
      <div className="exp-sticky">
        {/* Foto real da fachada, à esquerda, esmaecendo rumo ao carro */}
        <div className="exp-facade" aria-hidden />

        <div className="exp-stage">
          <Canvas
            camera={{ position: [5.5, 2.1, 6.4], fov: 32 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 2]}
          >
            <Suspense fallback={<Loader />}>
              <Studio />
              <Assembly
                key={model.id}
                model={model}
                progress={progress}
                stock={stock}
                hovered={hovered}
                setHovered={setHovered}
                onParts={handleParts}
              />
            </Suspense>
            <OrbitControls
              makeDefault
              enablePan={false}
              enableZoom={false}
              autoRotate={spin}
              autoRotateSpeed={0.55}
              minPolarAngle={Math.PI / 5}
              maxPolarAngle={Math.PI / 2.05}
            />
          </Canvas>
        </div>

        {/* ---- HUD ---- */}
        <div className="exp-hud">
          {/* A chamada some assim que o carro começa a abrir — o palco
              precisa ficar limpo para os rótulos técnicos. */}
          <div
            className="exp-hud-top"
            style={{
              opacity: Math.max(0, 1 - pct * 6),
              transform: `translateY(${-pct * 40}px)`,
            }}
          >
            <div>
              <p className="exp-kicker">Vista explodida interativa</p>
              <h2 className="exp-title">
                Todo carro que entra aqui
                <br />
                vira <span>{Object.keys(stock).length || 12} famílias de peça</span>.
              </h2>
              <p className="exp-sub">
                Role para desmontar. Clique num conjunto para ver o que temos em estoque.
              </p>
            </div>
          </div>

          {/* Legenda: o inventário real do pátio, ligado ao modelo 3D */}
          <ul className="exp-legend" data-vis={pct > 0.06 ? "1" : "0"}>
            {groupNames.map((g) => {
              const st = stock[g];
              return (
                <li key={g}>
                  <button
                    data-on={hovered === g ? "1" : "0"}
                    style={{ ["--accent" as string]: GROUP_ACCENT[g] ?? "#f0b41c" }}
                    onMouseEnter={() => setHovered(g)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => router.push(`/pecas?grupo=${encodeURIComponent(g)}`)}
                  >
                    <span className="exp-legend-dot" />
                    <span className="exp-legend-name">{g}</span>
                    <span className="exp-legend-qty">{st ? st.count : "—"}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="exp-hud-bottom">
            <div className="exp-switch-wrap">
              <p className="exp-switch-hint">
                Escolha um dos modelos ilustrativos de carros e divirta-se ao
                explorar nosso catálogo de peças.
              </p>
              <div className="exp-switch">
                {MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setModelId(m.id)}
                    data-on={m.id === model.id ? "1" : "0"}
                  >
                    <b>{m.label}</b>
                  </button>
                ))}
              </div>
            </div>

            <div className="exp-tools">
              <button onClick={() => setSpin((s) => !s)} data-on={spin ? "1" : "0"}>
                {spin ? "■ parar giro" : "▶ girar"}
              </button>
              <div className="exp-meter">
                <span style={{ width: `${pct * 100}%` }} />
              </div>
              <span className="exp-pct">{Math.round(pct * 100)}% desmontado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Só o modelo de abertura é pré-carregado. Puxar os três no load somaria 12MB
// antes do primeiro quadro; os outros dois chegam quando o visitante troca.
useGLTF.preload(MODELS[0].url, false);
