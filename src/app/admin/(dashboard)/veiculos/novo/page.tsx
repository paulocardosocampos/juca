import { VehicleWizard } from "@/components/admin/vehicle-wizard";

export const metadata = { title: "Novo veículo" };

export default function NewVehiclePage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="display text-2xl text-white">Novo veículo arrematado</h1>
        <p className="text-sm text-white/40">
          Identifique pela tabela FIPE e o sistema gera o checklist de peças automaticamente.
        </p>
      </div>
      <VehicleWizard />
    </div>
  );
}
