import { AiManagerRunner } from "@/components/dashboard/ai-manager-runner";
import { buildDeliveryManagerInput } from "@/lib/ai/delivery-manager";
import { getBusinessDataset } from "@/lib/mock-data";

export default function AiManagerPage() {
  const dataset = getBusinessDataset();
  const input = buildDeliveryManagerInput(dataset);

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold uppercase text-delivery">Operacion IA</p>
        <h1 className="text-3xl font-black tracking-normal text-primary">
          Delivery Manager
        </h1>
      </div>
      <AiManagerRunner input={input} />
    </div>
  );
}
