import { OrdersManager } from "@/components/dashboard/orders-manager";
import { getBusinessDataset } from "@/lib/mock-data";

export default function OrdersPage() {
  const { orders } = getBusinessDataset();

  return <OrdersManager initialOrders={orders} />;
}
