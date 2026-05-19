import { BillingManager } from "@/components/dashboard/billing-manager";
import { getBusinessDataset } from "@/lib/mock-data";

export default function BillingPage() {
  const { business } = getBusinessDataset();

  return <BillingManager currentPlan={business.plan} />;
}
