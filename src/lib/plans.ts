import type { SubscriptionPlan } from "@/lib/types";

export const OWNER_PRO_EMAIL = "ronnywoods77@gmail.com";

export type DashboardFeature =
  | "dashboard"
  | "businessProfile"
  | "store"
  | "products"
  | "orders"
  | "customers"
  | "accounting"
  | "deliveries"
  | "couriers"
  | "aiManager"
  | "billing";

export const planDetails: Record<
  SubscriptionPlan,
  {
    label: string;
    price: string;
    summary: string;
    limits: string[];
  }
> = {
  free: {
    label: "Gratis",
    price: "$0/mes",
    summary: "Para probar RightHand y empezar a vender.",
    limits: ["20 productos", "30 pedidos/mes", "Tienda publica y pedidos basicos"],
  },
  pyme: {
    label: "PYME",
    price: "$19/mes",
    summary: "Productos ilimitados, CRM, entregas y contabilidad operativa.",
    limits: ["Productos ilimitados", "CRM", "Entregas", "Auxiliar IVA"],
  },
  pro: {
    label: "Pro",
    price: "$49/mes",
    summary: "AI Delivery Manager, mensajeros y reportes completos.",
    limits: ["Todo PYME", "AI Delivery Manager", "Mensajeros", "Reportes"],
  },
  enterprise: {
    label: "Enterprise",
    price: "Personalizado",
    summary: "Operacion avanzada con soporte dedicado.",
    limits: ["Todo Pro", "Soporte personalizado", "Integraciones a medida"],
  },
};

const planRank: Record<SubscriptionPlan, number> = {
  free: 0,
  pyme: 1,
  pro: 2,
  enterprise: 3,
};

export const featureRules: Record<
  DashboardFeature,
  {
    label: string;
    minimumPlan: SubscriptionPlan;
    description: string;
  }
> = {
  dashboard: {
    label: "Resumen",
    minimumPlan: "free",
    description: "Indicadores basicos del negocio.",
  },
  businessProfile: {
    label: "Perfil negocio",
    minimumPlan: "free",
    description: "Provincia, ciudad, tipo de negocio, estilo, oferta y palabras clave.",
  },
  store: {
    label: "Tienda",
    minimumPlan: "free",
    description: "Constructor basico de tienda publica.",
  },
  products: {
    label: "Productos",
    minimumPlan: "free",
    description: "Inventario basico limitado en Gratis.",
  },
  orders: {
    label: "Pedidos",
    minimumPlan: "free",
    description: "Pedidos basicos limitados en Gratis.",
  },
  customers: {
    label: "CRM",
    minimumPlan: "pyme",
    description: "Clientes, notas, etiquetas y compras recurrentes.",
  },
  accounting: {
    label: "Contabilidad",
    minimumPlan: "pyme",
    description: "Facturacion, CSV, impresion/PDF y auxiliar IVA Costa Rica.",
  },
  deliveries: {
    label: "Entregas",
    minimumPlan: "pyme",
    description: "Rutas, zonas de entrega y enlaces Waze.",
  },
  couriers: {
    label: "Mensajeros",
    minimumPlan: "pro",
    description: "Red independiente, disponibilidad y comisiones por entrega.",
  },
  aiManager: {
    label: "AI Manager",
    minimumPlan: "pro",
    description: "Priorizacion, agrupacion de rutas, atrasos y mensajes al cliente.",
  },
  billing: {
    label: "Billing",
    minimumPlan: "free",
    description: "Gestion de plan y botones oficiales de PayPal.",
  },
};

export const freePlanLimits = {
  products: 20,
  monthlyOrders: 30,
};

export function normalizeSubscriptionPlan(
  value: string | null | undefined,
): SubscriptionPlan {
  if (value === "pyme" || value === "pro" || value === "enterprise") {
    return value;
  }

  return "free";
}

export function planMeetsMinimum(
  plan: SubscriptionPlan,
  minimumPlan: SubscriptionPlan,
) {
  return planRank[plan] >= planRank[minimumPlan];
}

export function canUseFeature(plan: SubscriptionPlan, feature: DashboardFeature) {
  return planMeetsMinimum(plan, featureRules[feature].minimumPlan);
}

export function paidPlanFromId(planId: string | null | undefined) {
  if (!planId) {
    return null;
  }

  if (planId === process.env.PAYPAL_PLAN_PYME_ID || planId === "P-7ER35589F36485216NIGO3JQ") {
    return "pyme" satisfies SubscriptionPlan;
  }

  if (planId === process.env.PAYPAL_PLAN_PRO_ID || planId === "P-8BN67865HY6507532NIGO4PI") {
    return "pro" satisfies SubscriptionPlan;
  }

  return null;
}

export function isEntitlementStatusActive(status: string | null | undefined) {
  return ["active", "approval_pending", "approved"].includes(
    String(status || "").toLowerCase(),
  );
}
