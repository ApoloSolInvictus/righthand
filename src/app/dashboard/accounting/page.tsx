import { AccountingManager } from "@/components/dashboard/accounting-manager";
import { PlanUpgradeCard } from "@/components/dashboard/plan-upgrade-card";
import { getCurrentAccount } from "@/lib/account-context";
import { getBusinessDataset } from "@/lib/mock-data";
import { canUseFeature } from "@/lib/plans";

export default async function AccountingPage() {
  const account = await getCurrentAccount();

  if (!canUseFeature(account.plan, "accounting")) {
    return <PlanUpgradeCard feature="accounting" currentPlan={account.plan} />;
  }

  const { business, orders } = getBusinessDataset();

  return <AccountingManager business={business} initialOrders={orders} />;
}
