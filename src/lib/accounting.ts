import type { AccountingInvoice, Order } from "@/lib/types";

export const COSTA_RICA_STANDARD_IVA_RATE = 0.13;

export type TaxPriceMode = "included" | "excluded";

export function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateIvaBreakdown({
  amount,
  taxRate = COSTA_RICA_STANDARD_IVA_RATE,
  mode = "included",
}: {
  amount: number;
  taxRate?: number;
  mode?: TaxPriceMode;
}) {
  const normalizedRate = taxRate < 1 ? taxRate : taxRate / 100;

  if (mode === "excluded") {
    const taxableAmount = roundCurrency(amount);
    const taxAmount = roundCurrency(taxableAmount * normalizedRate);

    return {
      taxableAmount,
      taxAmount,
      totalAmount: roundCurrency(taxableAmount + taxAmount),
    };
  }

  const totalAmount = roundCurrency(amount);
  const taxableAmount = roundCurrency(totalAmount / (1 + normalizedRate));

  return {
    taxableAmount,
    taxAmount: roundCurrency(totalAmount - taxableAmount),
    totalAmount,
  };
}

export function buildInvoiceFromOrder({
  order,
  taxRate = COSTA_RICA_STANDARD_IVA_RATE,
  mode = "included",
}: {
  order: Order;
  taxRate?: number;
  mode?: TaxPriceMode;
}): AccountingInvoice {
  const breakdown = calculateIvaBreakdown({
    amount: order.total,
    taxRate,
    mode,
  });

  return {
    id: `inv_${order.id}`,
    businessId: order.businessId,
    orderId: order.id,
    customerId: order.customerId,
    documentNumber: `FAC-${order.publicTrackingCode}`,
    issuedAt: order.createdAt,
    customerName: order.customerName,
    taxableAmount: breakdown.taxableAmount,
    exemptAmount: 0,
    taxRate: taxRate < 1 ? taxRate : taxRate / 100,
    taxAmount: breakdown.taxAmount,
    totalAmount: breakdown.totalAmount,
    status: order.status === "cancelled" ? "void" : "issued",
    source: "order",
  };
}

export function buildInvoicesFromOrders({
  orders,
  taxRate = COSTA_RICA_STANDARD_IVA_RATE,
  mode = "included",
}: {
  orders: Order[];
  taxRate?: number;
  mode?: TaxPriceMode;
}) {
  return orders.map((order) => buildInvoiceFromOrder({ order, taxRate, mode }));
}

export function summarizeInvoices(invoices: AccountingInvoice[]) {
  return invoices.reduce(
    (summary, invoice) => {
      if (invoice.status === "void") {
        return summary;
      }

      return {
        taxableAmount: roundCurrency(summary.taxableAmount + invoice.taxableAmount),
        exemptAmount: roundCurrency(summary.exemptAmount + invoice.exemptAmount),
        taxAmount: roundCurrency(summary.taxAmount + invoice.taxAmount),
        totalAmount: roundCurrency(summary.totalAmount + invoice.totalAmount),
        count: summary.count + 1,
      };
    },
    {
      taxableAmount: 0,
      exemptAmount: 0,
      taxAmount: 0,
      totalAmount: 0,
      count: 0,
    },
  );
}
