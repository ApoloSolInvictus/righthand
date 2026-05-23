"use client";

import { Minus, Plus, Save, X } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { usePersistentState } from "@/lib/local-demo-store";
import { getPlanProductLimit, planDetails } from "@/lib/plans";
import type { Product, ProductCategory, SubscriptionPlan } from "@/lib/types";
import { crcCurrency, formatPercent } from "@/lib/utils";

type ProductsManagerProps = {
  initialProducts: Product[];
  categories: ProductCategory[];
  currentPlan: SubscriptionPlan;
};

export function ProductsManager({
  initialProducts,
  categories,
  currentPlan,
}: ProductsManagerProps) {
  const [products, setProducts] = usePersistentState(
    "righthand:products",
    initialProducts,
  );
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const productLimit = getPlanProductLimit(currentPlan);
  const reachedProductLimit = productLimit !== null && products.length >= productLimit;

  function changeStock(productId: string, delta: number) {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? { ...product, stock: Math.max(0, product.stock + delta) }
          : product,
      ),
    );
    setMessage("Stock actualizado.");
  }

  function addProduct(formData: FormData) {
    if (reachedProductLimit && productLimit !== null) {
      setMessage(`El plan Gratis permite hasta ${productLimit} productos.`);
      setShowForm(false);
      return;
    }

    const price = Number(formData.get("price") || 0);
    const cost = Number(formData.get("cost") || 0);
    const first = initialProducts[0];

    const product: Product = {
      id: `p_demo_${Date.now()}`,
      businessId: first.businessId,
      categoryId: String(formData.get("categoryId") || categories[0]?.id || ""),
      name: String(formData.get("name") || "Producto demo"),
      description: String(formData.get("description") || ""),
      price,
      cost,
      stock: Number(formData.get("stock") || 0),
      imageUrl:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80",
      active: true,
    };

    setProducts((current) => [product, ...current]);
    setShowForm(false);
    setMessage("Producto creado en el inventario local.");
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-delivery">Inventario</p>
          <h1 className="text-3xl font-black tracking-normal text-primary">
            Productos y margen
          </h1>
          {productLimit !== null ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Plan {planDetails.free.label}: {products.length}/{productLimit} productos.
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          disabled={reachedProductLimit}
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nuevo producto
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Nuevo producto</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addProduct} className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" required placeholder="Producto" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="categoryId">Categoria</Label>
                <select
                  id="categoryId"
                  name="categoryId"
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Precio</Label>
                <Input id="price" name="price" type="number" min="0" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cost">Costo</Label>
                <Input id="cost" name="cost" type="number" min="0" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" name="stock" type="number" min="0" required />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="description">Descripcion</Label>
                <Textarea id="description" name="description" />
              </div>
              <div className="flex flex-wrap gap-2 md:col-span-2">
                <Button variant="success">
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Guardar producto
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
          <CardTitle>Catalogo</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Costo</TableHead>
                <TableHead>Margen</TableHead>
                <TableHead>Ajustar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const margin =
                  product.price === 0 ? 0 : (product.price - product.cost) / product.price;
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={product.imageUrl}
                          alt=""
                          className="h-12 w-12 rounded-md object-cover"
                        />
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {
                        categories.find(
                          (category) => category.id === product.categoryId,
                        )?.name
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.stock < 10 ? "delivery" : "secondary"}>
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell>{crcCurrency(product.price)}</TableCell>
                    <TableCell>{crcCurrency(product.cost)}</TableCell>
                    <TableCell className="font-semibold">
                      {formatPercent(margin)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => changeStock(product.id, -1)}
                          title="Rebajar stock"
                        >
                          <Minus className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => changeStock(product.id, 1)}
                          title="Aumentar stock"
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
