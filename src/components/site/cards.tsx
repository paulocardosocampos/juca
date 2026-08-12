import Link from "next/link";
import { JucaMark } from "@/components/mascot";
import { formatBRL, vehicleTitle } from "@/lib/format";

export function PhotoFrame({
  src,
  alt,
  className = "",
}: {
  src: string | undefined;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-raised overflow-hidden flex items-center justify-center ${className}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <JucaMark className="w-10 h-auto text-white/8" />
      )}
    </div>
  );
}

export interface PartCardData {
  id: string;
  name: string;
  price: number | null;
  featured: boolean;
  photos: string[];
  vehicle: { brand: string; model: string; modelYear: number };
}

export function PartCard({ part }: { part: PartCardData }) {
  return (
    <Link
      href={`/pecas/${part.id}`}
      className="group relative rounded-xl border border-white/8 bg-surface overflow-hidden flex flex-col transition-all duration-300 hover:border-white/20 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="relative">
        <PhotoFrame src={part.photos[0]} alt={part.name} className="aspect-[4/3]" />
        <div
          className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-70"
          aria-hidden
        />
        {part.featured && (
          <span className="absolute top-2.5 left-2.5 text-[9px] font-bold tracking-[0.12em] uppercase bg-gold text-base rounded px-2 py-1">
            Destaque
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1 flex-1">
        <h3 className="text-[14px] font-bold leading-snug text-white group-hover:text-gold transition-colors">
          {part.name}
        </h3>
        <p className="text-[11px] text-white/35 leading-snug">{vehicleTitle(part.vehicle)}</p>
        <p className="display text-lg text-white mt-auto pt-3 tabular-nums">
          {part.price != null ? formatBRL(part.price) : "Consultar"}
        </p>
      </div>
    </Link>
  );
}

export interface VehicleCardData {
  id: string;
  brand: string;
  model: string;
  modelYear: number;
  engine: string | null;
  doors: number;
  color: string | null;
  photos: string[];
  availableCount: number;
}

export function VehicleCard({ vehicle }: { vehicle: VehicleCardData }) {
  return (
    <Link
      href={`/veiculos/${vehicle.id}`}
      className="group rounded-xl border border-white/8 bg-surface overflow-hidden transition-all duration-300 hover:border-white/20 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="relative">
        <PhotoFrame
          src={vehicle.photos[0]}
          alt={vehicleTitle(vehicle)}
          className="aspect-[16/9]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80"
          aria-hidden
        />
        <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 text-[9px] font-bold tracking-[0.12em] uppercase bg-base/70 backdrop-blur border border-white/12 text-white/80 rounded px-2 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-signal-ok" aria-hidden />
          No pátio
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-[14px] font-bold text-white group-hover:text-gold transition-colors">
          {vehicleTitle(vehicle)}
        </h3>
        <p className="text-[11px] text-white/35 mt-1">
          {[vehicle.engine, `${vehicle.doors} portas`, vehicle.color].filter(Boolean).join(" · ")}
        </p>
        <p className="text-[12px] font-semibold text-gold mt-3">
          {vehicle.availableCount} peça{vehicle.availableCount === 1 ? "" : "s"} disponíve
          {vehicle.availableCount === 1 ? "l" : "is"} →
        </p>
      </div>
    </Link>
  );
}
