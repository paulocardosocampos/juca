import { VehicleWizard } from "@/components/admin/vehicle-wizard";
import { canSeeAuctionData, currentUser } from "@/lib/permissions";

export const metadata = { title: "Novo veículo" };

export default async function NewVehiclePage() {
  const me = await currentUser();
  const seeAuction = canSeeAuctionData(me);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold tracking-[0.24em] uppercase text-gold mb-2">
          Entrada no pátio
        </p>
        <h1 className="display text-[26px]">Novo veículo</h1>
        <p className="text-[13px] text-white/40 mt-2">
          Identifique pela tabela FIPE e o sistema gera o checklist de peças
          automaticamente.
        </p>
      </div>
      <VehicleWizard canSeeAuction={seeAuction} />
    </div>
  );
}
