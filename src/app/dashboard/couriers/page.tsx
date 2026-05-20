import { CouriersManager } from "@/components/dashboard/couriers-manager";
import { PlanUpgradeCard } from "@/components/dashboard/plan-upgrade-card";
import { getCurrentAccount } from "@/lib/account-context";
import { getBusinessDataset } from "@/lib/mock-data";
import { canUseFeature } from "@/lib/plans";

export default async function CouriersPage() {
  const account = await getCurrentAccount();

  if (!canUseFeature(account.plan, "couriers")) {
    return <PlanUpgradeCard feature="couriers" currentPlan={account.plan} />;
  }

  const { couriers } = getBusinessDataset();

  return <CouriersManager initialCouriers={couriers} />;
}
