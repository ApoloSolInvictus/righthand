import { CustomersManager } from "@/components/dashboard/customers-manager";
import { PlanUpgradeCard } from "@/components/dashboard/plan-upgrade-card";
import { getCurrentAccount } from "@/lib/account-context";
import { getBusinessDataset } from "@/lib/mock-data";
import { canUseFeature } from "@/lib/plans";

export default async function CustomersPage() {
  const account = await getCurrentAccount();

  if (!canUseFeature(account.plan, "customers")) {
    return <PlanUpgradeCard feature="customers" currentPlan={account.plan} />;
  }

  const { customers } = getBusinessDataset();

  return <CustomersManager initialCustomers={customers} />;
}
