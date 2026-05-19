import { TrackingCard } from "@/components/storefront/tracking-card";
import { getOrderByTrackingCode, orders } from "@/lib/mock-data";

export default async function TrackingPage({
  params,
}: {
  params: Promise<{ publicTrackingCode: string }>;
}) {
  const { publicTrackingCode } = await params;
  const order =
    getOrderByTrackingCode(publicTrackingCode) || {
      ...orders[0],
      id: `demo-${publicTrackingCode}`,
      publicTrackingCode,
      status: "new" as const,
      customerName: "Cliente demo",
      customerPhone: "Pendiente",
      address: "Direccion recibida en checkout demo",
      subtotal: 0,
      deliveryFee: 0,
      total: 0,
      items: [],
    };

  return (
    <main className="grid min-h-screen place-items-center bg-background p-4">
      <TrackingCard fallbackOrder={order} publicTrackingCode={publicTrackingCode} />
    </main>
  );
}
