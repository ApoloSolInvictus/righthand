import { CourierOrdersClient } from "@/components/courier/courier-orders-client";
import { getBusinessDataset } from "@/lib/mock-data";

export default function CourierOrdersPage() {
  const { deliveries, orders, couriers } = getBusinessDataset();
  const courier = couriers[0];

  return (
    <CourierOrdersClient
      courier={courier}
      initialDeliveries={deliveries}
      initialOrders={orders}
    />
  );
}
