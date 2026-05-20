import { BillingManager } from "@/components/dashboard/billing-manager";
import { getCurrentAccount } from "@/lib/account-context";

export default async function BillingPage() {
  const account = await getCurrentAccount();

  return (
    <BillingManager
      currentPlan={account.plan}
      businessId={account.businessId}
      isOwnerOverride={account.isOwnerOverride}
    />
  );
}
