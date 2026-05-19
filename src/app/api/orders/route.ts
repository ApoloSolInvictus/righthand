import { NextResponse } from "next/server";

import { getStoreBySlug, products } from "@/lib/mock-data";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    storeSlug?: string;
    customerName?: string;
    customerPhone?: string;
    address?: string;
    items?: Array<{ productId: string; quantity: number }>;
  };

  const store = body.storeSlug ? getStoreBySlug(body.storeSlug) : null;
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const selectedItems = (body.items || [])
    .map((item) => {
      const product = products.find(
        (candidate) =>
          candidate.id === item.productId && candidate.businessId === store.businessId,
      );
      return product
        ? {
            product,
            quantity: item.quantity,
            lineTotal: product.price * item.quantity,
          }
        : null;
    })
    .filter(Boolean);

  if (selectedItems.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const subtotal = selectedItems.reduce((sum, item) => sum + item!.lineTotal, 0);
  const deliveryFee = store.deliveryZones[0]?.fee || 0;
  const trackingCode = `RH-${store.slug
    .split("-")
    .map((part) => part[0])
    .join("")
    .toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  return NextResponse.json({
    trackingCode,
    status: "new",
    customerName: body.customerName,
    customerPhone: body.customerPhone,
    address: body.address,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
  });
}
