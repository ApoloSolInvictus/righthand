import { AccountingManager } from "@/components/dashboard/accounting-manager";
import { getBusinessDataset } from "@/lib/mock-data";

export default function AccountingPage() {
  const { business, orders } = getBusinessDataset();

  return <AccountingManager business={business} initialOrders={orders} />;
}
