"use client";

import { Cake, MessageSquarePlus, Save, X } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { usePersistentState } from "@/lib/local-demo-store";
import type { Customer } from "@/lib/types";
import { crcCurrency } from "@/lib/utils";

export function CustomersManager({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [customers, setCustomers] = usePersistentState(
    "righthand:customers",
    initialCustomers,
  );
  const [showNote, setShowNote] = useState(false);
  const [message, setMessage] = useState("");

  function addNote(formData: FormData) {
    const customerId = String(formData.get("customerId"));
    const note = String(formData.get("note") || "").trim();

    if (!note) {
      return;
    }

    setCustomers((current) =>
      current.map((customer) =>
        customer.id === customerId
          ? { ...customer, notes: [note, ...customer.notes] }
          : customer,
      ),
    );
    setShowNote(false);
    setMessage("Nota agregada al CRM local.");
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-delivery">CRM</p>
          <h1 className="text-3xl font-black tracking-normal text-primary">
            Clientes y relacion
          </h1>
        </div>
        <Button type="button" variant="outline" onClick={() => setShowNote(true)}>
          <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
          Nueva nota
        </Button>
      </div>

      {showNote ? (
        <Card>
          <CardHeader>
            <CardTitle>Nueva nota CRM</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addNote} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customerId">Cliente</Label>
                <select
                  id="customerId"
                  name="customerId"
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="note">Nota</Label>
                <Textarea id="note" name="note" required />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="success">
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Guardar nota
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowNote(false)}>
                  <X className="h-4 w-4" aria-hidden="true" />
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {message ? (
        <p className="rounded-md bg-success/10 p-3 text-sm font-medium text-success">
          {message}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Clientes frecuentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Etiquetas</TableHead>
                <TableHead>Cumpleanos</TableHead>
                <TableHead>Compras</TableHead>
                <TableHead>Total historico</TableHead>
                <TableHead>Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <p className="font-semibold">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">{customer.phone}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {customer.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.birthday ? (
                      <span className="inline-flex items-center gap-1">
                        <Cake className="h-4 w-4 text-delivery" aria-hidden="true" />
                        {new Date(customer.birthday).toLocaleDateString("es-CR", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    ) : (
                      "Pendiente"
                    )}
                  </TableCell>
                  <TableCell>{customer.totalOrders}</TableCell>
                  <TableCell>{crcCurrency(customer.totalSpent)}</TableCell>
                  <TableCell className="max-w-xs text-sm text-muted-foreground">
                    {customer.notes.join(" ")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
