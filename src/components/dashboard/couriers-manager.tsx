"use client";

import { Save, Send, ToggleLeft, ToggleRight, X } from "lucide-react";
import { useState } from "react";

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
import { usePersistentState } from "@/lib/local-demo-store";
import type { Courier } from "@/lib/types";
import { crcCurrency } from "@/lib/utils";

export function CouriersManager({ initialCouriers }: { initialCouriers: Courier[] }) {
  const [couriers, setCouriers] = usePersistentState(
    "righthand:couriers",
    initialCouriers,
  );
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  function toggleAvailability(courierId: string) {
    setCouriers((current) =>
      current.map((courier) =>
        courier.id === courierId
          ? { ...courier, available: !courier.available }
          : courier,
      ),
    );
    setMessage("Disponibilidad actualizada.");
  }

  function inviteCourier(formData: FormData) {
    const first = initialCouriers[0];
    const courier: Courier = {
      id: `co_demo_${Date.now()}`,
      businessId: first.businessId,
      name: String(formData.get("name") || "Mensajero demo"),
      phone: String(formData.get("phone") || ""),
      zone: String(formData.get("zone") || "GAM"),
      available: true,
      commissionPerDelivery: Number(formData.get("commissionPerDelivery") || 1500),
      activeOrders: 0,
    };

    setCouriers((current) => [courier, ...current]);
    setShowForm(false);
    setMessage(`Invitacion lista para ${courier.name}.`);
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-delivery">Mensajeros</p>
          <h1 className="text-3xl font-black tracking-normal text-primary">
            Red independiente
          </h1>
        </div>
        <Button type="button" onClick={() => setShowForm(true)}>
          <Send className="h-4 w-4" aria-hidden="true" />
          Invitar mensajero
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Invitar mensajero</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={inviteCourier} className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" required placeholder="Nombre completo" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input id="phone" name="phone" required placeholder="+506 8000-0000" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zone">Zona</Label>
                <Input id="zone" name="zone" required placeholder="San Pedro" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="commissionPerDelivery">Comision</Label>
                <Input
                  id="commissionPerDelivery"
                  name="commissionPerDelivery"
                  type="number"
                  min="0"
                  defaultValue={1500}
                />
              </div>
              <div className="flex flex-wrap gap-2 md:col-span-2">
                <Button variant="success">
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Guardar invitacion
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
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
          <CardTitle>Disponibilidad</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Telefono</TableHead>
                <TableHead>Zona</TableHead>
                <TableHead>Disponibilidad</TableHead>
                <TableHead>Pedidos asignados</TableHead>
                <TableHead>Comision</TableHead>
                <TableHead>Accion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {couriers.map((courier) => (
                <TableRow key={courier.id}>
                  <TableCell className="font-semibold">{courier.name}</TableCell>
                  <TableCell>{courier.phone}</TableCell>
                  <TableCell>{courier.zone}</TableCell>
                  <TableCell>
                    <Badge variant={courier.available ? "success" : "muted"}>
                      {courier.available ? (
                        <ToggleRight className="mr-1 h-3 w-3" aria-hidden="true" />
                      ) : (
                        <ToggleLeft className="mr-1 h-3 w-3" aria-hidden="true" />
                      )}
                      {courier.available ? "Disponible" : "Ocupado"}
                    </Badge>
                  </TableCell>
                  <TableCell>{courier.activeOrders}</TableCell>
                  <TableCell>{crcCurrency(courier.commissionPerDelivery)}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => toggleAvailability(courier.id)}
                    >
                      Cambiar
                    </Button>
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
