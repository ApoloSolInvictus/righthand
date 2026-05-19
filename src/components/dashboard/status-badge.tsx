import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/types";

const statusLabels: Record<OrderStatus, string> = {
  new: "Nuevo",
  confirmed: "Confirmado",
  preparing: "Preparando",
  ready_for_delivery: "Listo",
  in_route: "En ruta",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const statusVariants: Record<OrderStatus, "default" | "secondary" | "success" | "delivery" | "muted" | "destructive"> = {
  new: "default",
  confirmed: "secondary",
  preparing: "delivery",
  ready_for_delivery: "success",
  in_route: "delivery",
  delivered: "success",
  cancelled: "destructive",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={statusVariants[status]}>{statusLabels[status]}</Badge>;
}
