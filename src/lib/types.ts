export type BusinessRole = "owner" | "admin" | "sales" | "courier";

export type OrderStatus =
  | "new"
  | "confirmed"
  | "preparing"
  | "ready_for_delivery"
  | "in_route"
  | "delivered"
  | "cancelled";

export type SubscriptionPlan = "free" | "pyme" | "pro" | "enterprise";

export type BusinessCategory = "restaurante" | "tienda" | "pyme" | "farmacia";

export type MarketingFormatId =
  | "instagram_post"
  | "instagram_story"
  | "facebook_ad"
  | "whatsapp_status"
  | "flyer";

export type Business = {
  id: string;
  name: string;
  slug: string;
  type: BusinessCategory;
  description: string;
  plan: SubscriptionPlan;
  province: string;
  city: string;
  businessStyle: string;
  offerSummary: string;
  searchTags: string[];
};

export type Store = {
  id: string;
  businessId: string;
  slug: string;
  name: string;
  description: string;
  logoUrl: string;
  coverUrl: string;
  physicalAddress: string;
  lat?: number;
  lng?: number;
  primaryColor: string;
  successColor: string;
  deliveryColor: string;
  hours: string;
  deliveryZones: DeliveryZone[];
};

export type DeliveryZone = {
  id: string;
  businessId: string;
  name: string;
  fee: number;
  etaMinutes: number;
};

export type ProductCategory = {
  id: string;
  businessId: string;
  name: string;
};

export type Product = {
  id: string;
  businessId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  imageUrl: string;
  active: boolean;
};

export type BusinessOffer = {
  id: string;
  businessId: string;
  title: string;
  description: string;
  imageUrl: string;
  active: boolean;
};

export type MarketingCampaign = {
  id: string;
  businessId: string;
  title: string;
  campaignGoal: string;
  audience: string;
  offerText: string;
  instructions: string;
  formatId: MarketingFormatId;
  imageUrl: string;
  referenceImages: string[];
  captions: string[];
  hashtags: string[];
  createdAt: string;
};

export type Customer = {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  email?: string;
  birthday?: string;
  tags: string[];
  notes: string[];
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  businessId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  businessId: string;
  customerId: string;
  publicTrackingCode: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  address: string;
  zone: string;
  lat?: number;
  lng?: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  promisedAt: string;
  items: OrderItem[];
};

export type Courier = {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  zone: string;
  available: boolean;
  commissionPerDelivery: number;
  activeOrders: number;
};

export type Delivery = {
  id: string;
  businessId: string;
  orderId: string;
  courierId: string;
  status: "assigned" | "picked_up" | "delivered" | "failed";
  pickupAddress: string;
  dropoffAddress: string;
  lat?: number;
  lng?: number;
  proofPhotoUrl?: string;
};

export type AccountingInvoice = {
  id: string;
  businessId: string;
  orderId?: string;
  customerId?: string;
  documentNumber: string;
  issuedAt: string;
  customerName: string;
  taxableAmount: number;
  exemptAmount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  status: "draft" | "issued" | "paid" | "void";
  source: "order" | "manual";
};
