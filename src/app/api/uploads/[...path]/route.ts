import { NextRequest } from "next/server";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import type { ReadableStream as WebReadableStream } from "stream/web";
import { Readable } from "stream";

// Serve as fotos enviadas pelo admin.
//
// Em produção (next build + output standalone) o Next monta a lista de
// arquivos estáticos de /public no momento do build — arquivos gravados
// depois, como os uploads, não são servidos e dariam 404. Um rewrite em
// next.config.ts manda /uploads/* para cá, que lê direto do disco (volume).
// Sem "force-dynamic": ela já é dinâmica por ser catch-all, e o modo forçado
// faz o Next sobrescrever o Cache-Control com max-age=0.
export const runtime = "nodejs";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;

  const filePath = path.join(UPLOADS_DIR, ...segments);
  // Barra path traversal (../) — o alvo precisa estar dentro de uploads.
  const relative = path.relative(UPLOADS_DIR, filePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return new Response("Não encontrado", { status: 404 });
  }

  const contentType = CONTENT_TYPES[path.extname(filePath).toLowerCase()];
  if (!contentType) return new Response("Não encontrado", { status: 404 });

  try {
    const info = await stat(filePath);
    if (!info.isFile()) return new Response("Não encontrado", { status: 404 });

    const stream = Readable.toWeb(
      createReadStream(filePath),
    ) as WebReadableStream<Uint8Array>;

    return new Response(stream as unknown as BodyInit, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(info.size),
        // Os nomes são UUID: o conteúdo de um caminho nunca muda.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Não encontrado", { status: 404 });
  }
}
