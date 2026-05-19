"use client";

import {
  Calculator,
  Download,
  FileText,
  Printer,
  ReceiptText,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  COSTA_RICA_STANDARD_IVA_RATE,
  buildInvoicesFromOrders,
  summarizeInvoices,
  type TaxPriceMode,
} from "@/lib/accounting";
import { usePersistentState } from "@/lib/local-demo-store";
import type { Business, Order } from "@/lib/types";
import { crcCurrency, formatPercent } from "@/lib/utils";

type AccountingManagerProps = {
  business: Business;
  initialOrders: Order[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function invoiceMonth(value: string) {
  return new Date(value).toISOString().slice(0, 7);
}

function latestOrderMonth(orders: Order[]) {
  const latest = orders
    .map((order) => new Date(order.createdAt).getTime())
    .filter(Number.isFinite)
    .sort((a, b) => b - a)[0];

  return latest ? new Date(latest).toISOString().slice(0, 7) : currentMonth();
}

function csvEscape(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function AccountingManager({
  business,
  initialOrders,
}: AccountingManagerProps) {
  const [orders] = usePersistentState("righthand:orders", initialOrders);
  const [month, setMonth] = useState(() => latestOrderMonth(initialOrders));
  const [taxRatePercent, setTaxRatePercent] = useState(
    COSTA_RICA_STANDARD_IVA_RATE * 100,
  );
  const [mode, setMode] = useState<TaxPriceMode>("included");
  const [query, setQuery] = useState("");

  const taxRate = taxRatePercent / 100;
  const invoices = useMemo(
    () => buildInvoicesFromOrders({ orders, taxRate, mode }),
    [mode, orders, taxRate],
  );
  const filteredInvoices = useMemo(
    () =>
      invoices
        .filter((invoice) => invoiceMonth(invoice.issuedAt) === month)
        .filter((invoice) => {
          const normalizedQuery = query.trim().toLowerCase();

          if (!normalizedQuery) {
            return true;
          }

          return [
            invoice.documentNumber,
            invoice.customerName,
            invoice.status,
            invoice.totalAmount,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);
        }),
    [invoices, month, query],
  );
  const summary = summarizeInvoices(filteredInvoices);

  function printReport() {
    window.print();
  }

  function downloadCsv() {
    const headers = [
      "fecha",
      "documento",
      "cliente",
      "precio",
      "base_imponible",
      "exento",
      "iva",
      "total",
      "estado",
    ];
    const rows = filteredInvoices.map((invoice) => [
      formatDate(invoice.issuedAt),
      invoice.documentNumber,
      invoice.customerName,
      invoice.totalAmount,
      invoice.taxableAmount,
      invoice.exemptAmount,
      invoice.taxAmount,
      invoice.totalAmount,
      invoice.status,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => csvEscape(value)).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `righthand-auxiliar-iva-${business.slug}-${month}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-6">
      <div className="no-print flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-delivery">
            CRM contable
          </p>
          <h1 className="text-3xl font-black tracking-normal text-primary">
            Facturacion y auxiliar IVA
          </h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Reporte mensual para ventas gravadas, documentos emitidos e IVA
            debito fiscal de Costa Rica.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={downloadCsv}>
            <Download className="h-4 w-4" aria-hidden="true" />
            CSV
          </Button>
          <Button type="button" variant="delivery" onClick={printReport}>
            <Printer className="h-4 w-4" aria-hidden="true" />
            Imprimir / PDF
          </Button>
        </div>
      </div>

      <section className="no-print grid gap-4 lg:grid-cols-[1fr_1fr_180px_220px]">
        <div className="grid gap-2">
          <Label htmlFor="accountingMonth">Periodo</Label>
          <Input
            id="accountingMonth"
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="accountingSearch">Buscar</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="accountingSearch"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Documento o cliente"
              className="pl-9"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="taxRate">IVA %</Label>
          <Input
            id="taxRate"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={taxRatePercent}
            onChange={(event) => setTaxRatePercent(Number(event.target.value))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="taxMode">Modo de precio</Label>
          <select
            id="taxMode"
            value={mode}
            onChange={(event) => setMode(event.target.value as TaxPriceMode)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="included">Precio incluye IVA</option>
            <option value="excluded">Precio antes de IVA</option>
          </select>
        </div>
      </section>

      <section className="grid dashboard-grid gap-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Documentos
            </CardTitle>
            <ReceiptText className="h-4 w-4 text-primary" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.count}</div>
            <p className="mt-1 text-xs text-muted-foreground">Facturas del periodo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ventas gravadas
            </CardTitle>
            <Calculator className="h-4 w-4 text-success" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{crcCurrency(summary.taxableAmount)}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Base imponible {formatPercent(taxRate)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              IVA debito fiscal
            </CardTitle>
            <FileText className="h-4 w-4 text-delivery" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{crcCurrency(summary.taxAmount)}</div>
            <p className="mt-1 text-xs text-muted-foreground">Auxiliar de ventas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total facturado
            </CardTitle>
            <ReceiptText className="h-4 w-4 text-primary" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{crcCurrency(summary.totalAmount)}</div>
            <p className="mt-1 text-xs text-muted-foreground">Incluye IVA</p>
          </CardContent>
        </Card>
      </section>

      <Card className="accounting-print print-surface">
        <CardHeader className="gap-3 border-b">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <p className="text-sm font-semibold uppercase text-delivery">
                RightHand
              </p>
              <CardTitle>Auxiliar IVA Costa Rica</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {business.name} / periodo {month}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">IVA {formatPercent(taxRate)}</Badge>
              <Badge variant={mode === "included" ? "success" : "delivery"}>
                {mode === "included" ? "IVA incluido" : "IVA separado"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Base</TableHead>
                <TableHead className="text-right">Exento</TableHead>
                <TableHead className="text-right">IVA</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{formatDate(invoice.issuedAt)}</TableCell>
                  <TableCell className="font-semibold">
                    {invoice.documentNumber}
                  </TableCell>
                  <TableCell>{invoice.customerName}</TableCell>
                  <TableCell className="text-right">
                    {crcCurrency(invoice.totalAmount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {crcCurrency(invoice.taxableAmount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {crcCurrency(invoice.exemptAmount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {crcCurrency(invoice.taxAmount)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {crcCurrency(invoice.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={invoice.status === "void" ? "destructive" : "success"}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No hay documentos para este periodo.
                  </TableCell>
                </TableRow>
              ) : null}
              <TableRow className="bg-secondary/70 font-bold hover:bg-secondary/70">
                <TableCell colSpan={3}>Totales</TableCell>
                <TableCell className="text-right">
                  {crcCurrency(summary.totalAmount)}
                </TableCell>
                <TableCell className="text-right">
                  {crcCurrency(summary.taxableAmount)}
                </TableCell>
                <TableCell className="text-right">
                  {crcCurrency(summary.exemptAmount)}
                </TableCell>
                <TableCell className="text-right">
                  {crcCurrency(summary.taxAmount)}
                </TableCell>
                <TableCell className="text-right">
                  {crcCurrency(summary.totalAmount)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="no-print text-xs text-muted-foreground">
        El reporte usa la tarifa general configurable del IVA. Revisa con tu contador
        si tienes productos exentos, tarifa reducida o comprobantes electronicos que
        deban conciliarse con Hacienda.
      </p>
    </div>
  );
}
