import { AiManagerRunner } from "@/components/dashboard/ai-manager-runner";
import { PlanUpgradeCard } from "@/components/dashboard/plan-upgrade-card";
import { getCurrentAccount } from "@/lib/account-context";
import { buildDeliveryManagerInput } from "@/lib/ai/delivery-manager";
import { getBusinessDataset } from "@/lib/mock-data";
import { canUseFeature } from "@/lib/plans";

export default async function AiManagerPage() {
  const account = await getCurrentAccount();

  if (!canUseFeature(account.plan, "aiManager")) {
    return <PlanUpgradeCard feature="aiManager" currentPlan={account.plan} />;
  }

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
