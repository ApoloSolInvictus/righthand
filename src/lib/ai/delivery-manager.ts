import { z } from "zod";

import type { Courier, DeliveryZone, Order, Store } from "@/lib/types";
import { generateWazeLink } from "@/lib/waze";

export const DeliveryManagerInputSchema = z.object({
  orders: z.array(
    z.object({
      id: z.string(),
      publicTrackingCode: z.string(),
      status: z.string(),
      customerName: z.string(),
      customerPhone: z.string(),
      address: z.string(),
      zone: z.string(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      total: z.number(),
      createdAt: z.string(),
      promisedAt: z.string(),
      items: z.array(z.object({ productName: z.string(), quantity: z.number() })),
    }),
  ),
  zones: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      fee: z.number(),
      etaMinutes: z.number(),
    }),
  ),
  couriers: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      phone: z.string(),
      zone: z.string(),
      available: z.boolean(),
      commissionPerDelivery: z.number(),
      activeOrders: z.number(),
    }),
  ),
  businessHours: z.string(),
  estimatedPrepMinutes: z.number().default(18),
});

export const DeliveryManagerResponseSchema = z.object({
  priorities: z.array(
    z.object({
      orderId: z.string(),
      level: z.enum(["low", "medium", "high", "urgent"]),
      reason: z.string(),
    }),
  ),
  routes: z.array(
    z.object({
      zone: z.string(),
      orderIds: z.array(z.string()),
      wazeLinks: z.array(z.string()),
      rationale: z.string(),
    }),
  ),
  courierRecommendations: z.array(
    z.object({
      orderId: z.string(),
      courierId: z.string().nullable(),
      courierName: z.string().nullable(),
      reason: z.string(),
    }),
  ),
  messages: z.array(
    z.object({
      orderId: z.string(),
      channel: z.enum(["whatsapp", "sms"]),
      message: z.string(),
    }),
  ),
  alerts: z.array(
    z.object({
      orderId: z.string().nullable(),
      severity: z.enum(["info", "warning", "critical"]),
      message: z.string(),
    }),
  ),
  suggestions: z.array(z.string()),
});

export type DeliveryManagerInput = z.infer<typeof DeliveryManagerInputSchema>;
export type DeliveryManagerResponse = z.infer<typeof DeliveryManagerResponseSchema>;

export function buildDeliveryManagerInput({
  orders,
  zones,
  couriers,
  store,
}: {
  orders: Order[];
  zones: DeliveryZone[];
  couriers: Courier[];
  store: Store;
}): DeliveryManagerInput {
  return {
    orders: orders
      .filter((order) => !["delivered", "cancelled"].includes(order.status))
      .map((order) => ({
        id: order.id,
        publicTrackingCode: order.publicTrackingCode,
        status: order.status,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        address: order.address,
        zone: order.zone,
        lat: order.lat,
        lng: order.lng,
        total: order.total,
        createdAt: order.createdAt,
        promisedAt: order.promisedAt,
        items: order.items.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
        })),
      })),
    zones,
    couriers,
    businessHours: store.hours,
    estimatedPrepMinutes: 18,
  };
}

export function heuristicDeliveryPlan(input: DeliveryManagerInput): DeliveryManagerResponse {
  const availableCouriers = input.couriers.filter((courier) => courier.available);
  const grouped = new Map<string, DeliveryManagerInput["orders"]>();
  const now = Date.now();

  input.orders.forEach((order) => {
    const current = grouped.get(order.zone) || [];
    current.push(order);
    grouped.set(order.zone, current);
  });

  return {
    priorities: input.orders.map((order) => {
      const minutesToPromise = (new Date(order.promisedAt).getTime() - now) / 60000;
      const level =
        minutesToPromise < 0
          ? "urgent"
          : minutesToPromise < 25 || order.status === "ready_for_delivery"
            ? "high"
            : order.status === "preparing"
              ? "medium"
              : "low";

      return {
        orderId: order.id,
        level,
        reason:
          level === "urgent"
            ? "La hora prometida ya paso o esta en riesgo inmediato."
            : `Pedido ${order.status} para ${order.zone}.`,
      };
    }),
    routes: Array.from(grouped.entries()).map(([zone, zoneOrders]) => ({
      zone,
      orderIds: zoneOrders.map((order) => order.id),
      wazeLinks: zoneOrders.map((order) =>
        generateWazeLink({ lat: order.lat, lng: order.lng, address: order.address }),
      ),
      rationale: `Agrupado por zona ${zone} para reducir tiempos muertos.`,
    })),
    courierRecommendations: input.orders.map((order, index) => {
      const courier =
        availableCouriers.find((item) =>
          item.zone.toLowerCase().includes(order.zone.toLowerCase()),
        ) || availableCouriers[index % Math.max(availableCouriers.length, 1)];

      return {
        orderId: order.id,
        courierId: courier?.id || null,
        courierName: courier?.name || null,
        reason: courier
          ? `${courier.name} esta disponible y cubre ${courier.zone}.`
          : "No hay mensajeros disponibles; mantener pedido sin asignar.",
      };
    }),
    messages: input.orders.map((order) => ({
      orderId: order.id,
      channel: "whatsapp",
      message: `Hola ${order.customerName}, tu pedido ${order.publicTrackingCode} esta ${order.status}. Te avisaremos apenas salga en ruta.`,
    })),
    alerts: input.orders
      .filter((order) => new Date(order.promisedAt).getTime() < now)
      .map((order) => ({
        orderId: order.id,
        severity: "critical",
        message: `${order.publicTrackingCode} supero la hora prometida.`,
      })),
    suggestions: [
      "Preparar pedidos por zona antes de asignar mensajero.",
      "Confirmar direccion y telefono en checkout para evitar llamadas.",
      "Usar mensajes transaccionales solo para estado de pedido y entrega.",
    ],
  };
}
