import { CustomersManager } from "@/components/dashboard/customers-manager";
import { getBusinessDataset } from "@/lib/mock-data";

export default function CustomersPage() {
  const { customers } = getBusinessDataset();

  return <CustomersManager initialCustomers={customers} />;
}
