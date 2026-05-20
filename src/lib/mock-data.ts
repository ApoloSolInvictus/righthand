import type {
  Business,
  Courier,
  Customer,
  Delivery,
  DeliveryZone,
  Order,
  Product,
  ProductCategory,
  Store,
} from "./types";

export const businesses: Business[] = [
  {
    id: "b_soda_luna",
    name: "Soda Luna",
    slug: "soda-luna",
    type: "restaurante",
    description: "Casados, desayunos y express en San Pedro.",
    plan: "free",
  },
  {
    id: "b_moda_tica",
    name: "Moda Tica",
    slug: "moda-tica",
    type: "ropa",
    description: "Ropa casual para entregas rapidas en GAM.",
    plan: "free",
  },
  {
    id: "b_farma_central",
    name: "Farma Central",
    slug: "farma-central",
    type: "farmacia",
    description: "Farmacia de barrio con entregas programadas.",
    plan: "free",
  },
];

export const deliveryZones: DeliveryZone[] = [
  {
    id: "z_san_pedro",
    businessId: "b_soda_luna",
    name: "San Pedro",
    fee: 1200,
    etaMinutes: 25,
  },
  {
    id: "z_curridabat",
    businessId: "b_soda_luna",
    name: "Curridabat",
    fee: 1800,
    etaMinutes: 35,
  },
  {
    id: "z_escazu",
    businessId: "b_moda_tica",
    name: "Escazu",
    fee: 2200,
    etaMinutes: 45,
  },
  {
    id: "z_rohrmoser",
    businessId: "b_farma_central",
    name: "Rohrmoser",
    fee: 1500,
    etaMinutes: 30,
  },
];

export const stores: Store[] = [
  {
    id: "s_soda_luna",
    businessId: "b_soda_luna",
    slug: "soda-luna",
    name: "Soda Luna",
    description:
      "Comida casera lista para almuerzo de oficina, con rutas express al este de San Jose.",
    logoUrl:
      "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=300&q=80",
    coverUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80",
    primaryColor: "#103A5C",
    successColor: "#219E6B",
    deliveryColor: "#F97316",
    hours: "Lunes a sabado, 7:00 a.m. - 8:00 p.m.",
    deliveryZones: deliveryZones.filter((zone) => zone.businessId === "b_soda_luna"),
  },
  {
    id: "s_moda_tica",
    businessId: "b_moda_tica",
    slug: "moda-tica",
    name: "Moda Tica",
    description:
      "Outfits casuales, cambios coordinados y entregas por zona para clientas frecuentes.",
    logoUrl:
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=300&q=80",
    coverUrl:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80",
    primaryColor: "#173B57",
    successColor: "#22A06B",
    deliveryColor: "#EA7A24",
    hours: "Lunes a viernes, 10:00 a.m. - 7:00 p.m.",
    deliveryZones: deliveryZones.filter((zone) => zone.businessId === "b_moda_tica"),
  },
  {
    id: "s_farma_central",
    businessId: "b_farma_central",
    slug: "farma-central",
    name: "Farma Central",
    description:
      "Productos esenciales, vitaminas y entregas discretas para clientes recurrentes.",
    logoUrl:
      "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=300&q=80",
    coverUrl:
      "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=1600&q=80",
    primaryColor: "#103A5C",
    successColor: "#1F9D6A",
    deliveryColor: "#F97316",
    hours: "Todos los dias, 8:00 a.m. - 9:00 p.m.",
    deliveryZones: deliveryZones.filter(
      (zone) => zone.businessId === "b_farma_central",
    ),
  },
];

export const productCategories: ProductCategory[] = [
  { id: "c_almuerzos", businessId: "b_soda_luna", name: "Almuerzos" },
  { id: "c_bebidas", businessId: "b_soda_luna", name: "Bebidas" },
  { id: "c_blusas", businessId: "b_moda_tica", name: "Blusas" },
  { id: "c_basicos", businessId: "b_moda_tica", name: "Basicos" },
  { id: "c_farma", businessId: "b_farma_central", name: "Farmacia" },
];

export const products: Product[] = [
  {
    id: "p_casado_pollo",
    businessId: "b_soda_luna",
    categoryId: "c_almuerzos",
    name: "Casado con pollo",
    description: "Arroz, frijoles, ensalada, maduro y pollo en salsa.",
    price: 4200,
    cost: 2350,
    stock: 28,
    imageUrl:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=700&q=80",
    active: true,
  },
  {
    id: "p_chifrijo",
    businessId: "b_soda_luna",
    categoryId: "c_almuerzos",
    name: "Chifrijo ejecutivo",
    description: "Chicharron, frijoles tiernos, pico de gallo y chips.",
    price: 4800,
    cost: 2600,
    stock: 18,
    imageUrl:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=700&q=80",
    active: true,
  },
  {
    id: "p_fresco_cas",
    businessId: "b_soda_luna",
    categoryId: "c_bebidas",
    name: "Fresco natural de cas",
    description: "500 ml, preparado al momento.",
    price: 1200,
    cost: 420,
    stock: 42,
    imageUrl:
      "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=700&q=80",
    active: true,
  },
  {
    id: "p_blusa_lino",
    businessId: "b_moda_tica",
    categoryId: "c_blusas",
    name: "Blusa lino terracota",
    description: "Tallas S-M-L, corte fresco para oficina.",
    price: 16900,
    cost: 8800,
    stock: 12,
    imageUrl:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80",
    active: true,
  },
  {
    id: "p_jean_recto",
    businessId: "b_moda_tica",
    categoryId: "c_basicos",
    name: "Jean recto azul",
    description: "Denim medio, tiro alto, tallas 26-34.",
    price: 24900,
    cost: 13700,
    stock: 9,
    imageUrl:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80",
    active: true,
  },
  {
    id: "p_vitamina_c",
    businessId: "b_farma_central",
    categoryId: "c_farma",
    name: "Vitamina C 1000 mg",
    description: "Frasco de 60 tabletas.",
    price: 6900,
    cost: 4100,
    stock: 35,
    imageUrl:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=700&q=80",
    active: true,
  },
  {
    id: "p_alcohol_gel",
    businessId: "b_farma_central",
    categoryId: "c_farma",
    name: "Alcohol en gel 250 ml",
    description: "Uso familiar y oficina.",
    price: 2600,
    cost: 1150,
    stock: 50,
    imageUrl:
      "https://images.unsplash.com/photo-1583947581924-a31d3c2f4354?auto=format&fit=crop&w=700&q=80",
    active: true,
  },
];

export const customers: Customer[] = [
  {
    id: "cu_maria",
    businessId: "b_soda_luna",
    name: "Maria Fernanda Rojas",
    phone: "+506 8888-1111",
    email: "maria.demo@example.com",
    birthday: "1991-06-14",
    tags: ["frecuente", "almuerzo oficina"],
    notes: ["Prefiere poca sal.", "Paga por SINPE al confirmar."],
    totalOrders: 12,
    totalSpent: 62400,
    lastOrderAt: "2026-05-18T12:15:00-06:00",
  },
  {
    id: "cu_esteban",
    businessId: "b_soda_luna",
    name: "Esteban Vargas",
    phone: "+506 8999-2222",
    birthday: "1986-11-03",
    tags: ["empresa", "recurrente"],
    notes: ["Pide para 3 personas los viernes."],
    totalOrders: 8,
    totalSpent: 45800,
    lastOrderAt: "2026-05-18T11:58:00-06:00",
  },
  {
    id: "cu_paola",
    businessId: "b_moda_tica",
    name: "Paola Jimenez",
    phone: "+506 8777-3333",
    birthday: "1994-09-21",
    tags: ["cambios", "VIP"],
    notes: ["Le gustan tonos neutros."],
    totalOrders: 5,
    totalSpent: 116500,
    lastOrderAt: "2026-05-17T15:30:00-06:00",
  },
  {
    id: "cu_jorge",
    businessId: "b_farma_central",
    name: "Jorge Mora",
    phone: "+506 8666-4444",
    tags: ["mensual", "medicamentos"],
    notes: ["Entregar despues de 6 p.m."],
    totalOrders: 4,
    totalSpent: 27600,
    lastOrderAt: "2026-05-16T18:05:00-06:00",
  },
];

export const orders: Order[] = [
  {
    id: "o_1001",
    businessId: "b_soda_luna",
    customerId: "cu_maria",
    publicTrackingCode: "RH-SL-1001",
    status: "ready_for_delivery",
    customerName: "Maria Fernanda Rojas",
    customerPhone: "+506 8888-1111",
    address: "Barrio Dent, San Pedro, Montes de Oca",
    zone: "San Pedro",
    lat: 9.9329,
    lng: -84.0508,
    subtotal: 9600,
    deliveryFee: 1200,
    total: 10800,
    createdAt: "2026-05-18T11:40:00-06:00",
    promisedAt: "2026-05-18T12:35:00-06:00",
    items: [
      {
        id: "oi_1001_1",
        orderId: "o_1001",
        businessId: "b_soda_luna",
        productId: "p_chifrijo",
        productName: "Chifrijo ejecutivo",
        quantity: 2,
        unitPrice: 4800,
      },
    ],
  },
  {
    id: "o_1002",
    businessId: "b_soda_luna",
    customerId: "cu_esteban",
    publicTrackingCode: "RH-SL-1002",
    status: "preparing",
    customerName: "Esteban Vargas",
    customerPhone: "+506 8999-2222",
    address: "Pinares, Curridabat",
    zone: "Curridabat",
    lat: 9.9159,
    lng: -84.0334,
    subtotal: 13800,
    deliveryFee: 1800,
    total: 15600,
    createdAt: "2026-05-18T12:02:00-06:00",
    promisedAt: "2026-05-18T13:00:00-06:00",
    items: [
      {
        id: "oi_1002_1",
        orderId: "o_1002",
        businessId: "b_soda_luna",
        productId: "p_casado_pollo",
        productName: "Casado con pollo",
        quantity: 3,
        unitPrice: 4200,
      },
      {
        id: "oi_1002_2",
        orderId: "o_1002",
        businessId: "b_soda_luna",
        productId: "p_fresco_cas",
        productName: "Fresco natural de cas",
        quantity: 1,
        unitPrice: 1200,
      },
    ],
  },
  {
    id: "o_2001",
    businessId: "b_moda_tica",
    customerId: "cu_paola",
    publicTrackingCode: "RH-MT-2001",
    status: "in_route",
    customerName: "Paola Jimenez",
    customerPhone: "+506 8777-3333",
    address: "Centro Comercial Paco, Escazu",
    zone: "Escazu",
    subtotal: 24900,
    deliveryFee: 2200,
    total: 27100,
    createdAt: "2026-05-18T10:20:00-06:00",
    promisedAt: "2026-05-18T13:15:00-06:00",
    items: [
      {
        id: "oi_2001_1",
        orderId: "o_2001",
        businessId: "b_moda_tica",
        productId: "p_jean_recto",
        productName: "Jean recto azul",
        quantity: 1,
        unitPrice: 24900,
      },
    ],
  },
  {
    id: "o_3001",
    businessId: "b_farma_central",
    customerId: "cu_jorge",
    publicTrackingCode: "RH-FC-3001",
    status: "confirmed",
    customerName: "Jorge Mora",
    customerPhone: "+506 8666-4444",
    address: "Rohrmoser, frente a Plaza Mayor",
    zone: "Rohrmoser",
    subtotal: 9500,
    deliveryFee: 1500,
    total: 11000,
    createdAt: "2026-05-18T09:15:00-06:00",
    promisedAt: "2026-05-18T18:30:00-06:00",
    items: [
      {
        id: "oi_3001_1",
        orderId: "o_3001",
        businessId: "b_farma_central",
        productId: "p_vitamina_c",
        productName: "Vitamina C 1000 mg",
        quantity: 1,
        unitPrice: 6900,
      },
      {
        id: "oi_3001_2",
        orderId: "o_3001",
        businessId: "b_farma_central",
        productId: "p_alcohol_gel",
        productName: "Alcohol en gel 250 ml",
        quantity: 1,
        unitPrice: 2600,
      },
    ],
  },
];

export const couriers: Courier[] = [
  {
    id: "co_andres",
    businessId: "b_soda_luna",
    name: "Andres Solis",
    phone: "+506 8555-1010",
    zone: "San Pedro / Curridabat",
    available: true,
    commissionPerDelivery: 1600,
    activeOrders: 1,
  },
  {
    id: "co_lucia",
    businessId: "b_soda_luna",
    name: "Lucia Navarro",
    phone: "+506 8555-2020",
    zone: "Este GAM",
    available: true,
    commissionPerDelivery: 1800,
    activeOrders: 0,
  },
  {
    id: "co_david",
    businessId: "b_moda_tica",
    name: "David Chaves",
    phone: "+506 8555-3030",
    zone: "Oeste GAM",
    available: false,
    commissionPerDelivery: 2200,
    activeOrders: 1,
  },
];

export const deliveries: Delivery[] = [
  {
    id: "d_1001",
    businessId: "b_soda_luna",
    orderId: "o_1001",
    courierId: "co_andres",
    status: "assigned",
    pickupAddress: "Soda Luna, San Pedro",
    dropoffAddress: "Barrio Dent, San Pedro, Montes de Oca",
    lat: 9.9329,
    lng: -84.0508,
  },
  {
    id: "d_2001",
    businessId: "b_moda_tica",
    orderId: "o_2001",
    courierId: "co_david",
    status: "picked_up",
    pickupAddress: "Moda Tica, Sabana",
    dropoffAddress: "Centro Comercial Paco, Escazu",
  },
];

export function getPrimaryBusiness() {
  return businesses[0];
}

export function getBusinessBySlug(slug: string) {
  return businesses.find((business) => business.slug === slug);
}

export function getStoreBySlug(slug: string) {
  return stores.find((store) => store.slug === slug);
}

export function getBusinessDataset(businessId = getPrimaryBusiness().id) {
  return {
    business: businesses.find((business) => business.id === businessId)!,
    store: stores.find((store) => store.businessId === businessId)!,
    products: products.filter((product) => product.businessId === businessId),
    categories: productCategories.filter(
      (category) => category.businessId === businessId,
    ),
    customers: customers.filter((customer) => customer.businessId === businessId),
    orders: orders.filter((order) => order.businessId === businessId),
    couriers: couriers.filter((courier) => courier.businessId === businessId),
    deliveries: deliveries.filter((delivery) => delivery.businessId === businessId),
    zones: deliveryZones.filter((zone) => zone.businessId === businessId),
  };
}

export function getOrderByTrackingCode(publicTrackingCode: string) {
  return orders.find(
    (order) =>
      order.publicTrackingCode.toLowerCase() === publicTrackingCode.toLowerCase(),
  );
}
