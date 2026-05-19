import { CouriersManager } from "@/components/dashboard/couriers-manager";
import { getBusinessDataset } from "@/lib/mock-data";

export default function CouriersPage() {
  const { couriers } = getBusinessDataset();

  return <CouriersManager initialCouriers={couriers} />;
}
