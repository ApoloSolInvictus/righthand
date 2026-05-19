import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CheckoutForm } from "@/components/storefront/checkout-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStoreBySlug, products } from "@/lib/mock-data";

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ product?: string }>;
}) {
  const { slug } = await params;
  const { product } = await searchParams;
  const store = getStoreBySlug(slug);

  if (!store) {
    notFound();
  }

  const storeProducts = products.filter((product) => product.businessId === store.businessId);

  return (
    <main className="min-h-screen bg-background">
      <div className="container py-6">
        <Button asChild variant="ghost" className="mb-6">
          <Link href={`/tienda/${store.slug}`}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver a tienda
          </Link>
        </Button>

        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Badge variant="delivery">Checkout</Badge>
            <h1 className="mt-3 text-3xl font-black tracking-normal text-primary">
              Pedido en {store.name}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Datos demo; al conectar Supabase se persiste en orders y order_items.
            </p>
          </div>
          <img src={store.logoUrl} alt="" className="h-16 w-16 rounded-lg object-cover" />
        </div>

        <CheckoutForm
          store={store}
          products={storeProducts}
          selectedProductId={product}
        />
      </div>
    </main>
  );
}
