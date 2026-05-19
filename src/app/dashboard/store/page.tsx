import { StoreBuilderClient } from "@/components/dashboard/store-builder-client";
import { getBusinessDataset } from "@/lib/mock-data";

export default function StoreBuilderPage() {
  const { store, zones } = getBusinessDataset();

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold uppercase text-delivery">Constructor</p>
        <h1 className="text-3xl font-black tracking-normal text-primary">
          Tienda publica
        </h1>
        <p className="mt-2 text-muted-foreground">
          Configura identidad, colores, horarios, portada y zonas de entrega.
        </p>
      </div>
      <StoreBuilderClient initialStore={store} zones={zones} />
    </div>
  );
}
