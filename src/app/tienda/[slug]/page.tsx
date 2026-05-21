import { Clock3, MapPinned, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { businessCategoryLabels } from "@/lib/business-profile";
import {
  getBusinessBySlug,
  getStoreBySlug,
  products,
  productCategories,
  stores,
} from "@/lib/mock-data";
import { crcCurrency } from "@/lib/utils";

export function generateStaticParams() {
  return stores.map((store) => ({ slug: store.slug }));
}

export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = getStoreBySlug(slug);
  const business = getBusinessBySlug(slug);

  if (!store || !business) {
    notFound();
  }

  const storeProducts = products.filter((product) => product.businessId === store.businessId);
  const categories = productCategories.filter(
    (category) => category.businessId === store.businessId,
  );

  return (
    <main className="min-h-screen bg-background">
      <section
        className="relative min-h-[48vh] bg-cover bg-center text-white"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(8,27,47,.88), rgba(8,27,47,.38)), url('${store.coverUrl}')`,
        }}
      >
        <div className="container flex min-h-[48vh] flex-col justify-between py-6">
          <header className="flex items-center justify-between gap-4">
            <Link href="/" className="font-bold">
              RightHand
            </Link>
            <Button asChild variant="delivery">
              <Link href={`/tienda/${store.slug}/checkout`}>
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                Checkout
              </Link>
            </Button>
          </header>
          <div className="max-w-3xl pb-10">
            <div className="mb-4 flex items-center gap-3">
              <img
                src={store.logoUrl}
                alt=""
                className="h-16 w-16 rounded-lg object-cover ring-4 ring-white/20"
              />
              <div>
                <h1 className="text-4xl font-black tracking-normal md:text-6xl">
                  {store.name}
                </h1>
                <p className="text-white/80">/{store.slug}</p>
              </div>
            </div>
            <p className="text-lg leading-8 text-white/85">{store.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge variant="secondary">
                {businessCategoryLabels[business.type]}
              </Badge>
              <Badge variant="secondary">
                {business.city}, {business.province}
              </Badge>
              <Badge variant="delivery">{business.businessStyle}</Badge>
              <Badge variant="success">
                <Clock3 className="mr-1 h-3 w-3" aria-hidden="true" />
                {store.hours}
              </Badge>
              {store.deliveryZones.map((zone) => (
                <Badge key={zone.id} variant="delivery">
                  <MapPinned className="mr-1 h-3 w-3" aria-hidden="true" />
                  {zone.name} {crcCurrency(zone.fee)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container py-10">
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge key={category.id} variant="secondary">
              {category.name}
            </Badge>
          ))}
        </div>
        <Card className="mb-6">
          <CardContent className="grid gap-3 p-5 md:grid-cols-[1fr_1.2fr] md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase text-delivery">
                Perfil del negocio
              </p>
              <h2 className="mt-1 text-xl font-black tracking-normal text-primary">
                {business.businessStyle}
              </h2>
            </div>
            <div>
              <p className="text-sm leading-6 text-muted-foreground">
                {business.offerSummary}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {business.searchTags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {storeProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <img src={product.imageUrl} alt="" className="h-48 w-full object-cover" />
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold">{product.name}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {product.description}
                    </p>
                  </div>
                  <Badge variant={product.stock < 10 ? "delivery" : "secondary"}>
                    {product.stock}
                  </Badge>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <p className="text-xl font-black text-primary">
                    {crcCurrency(product.price)}
                  </p>
                  <Button asChild size="sm" variant="delivery">
                    <Link href={`/tienda/${store.slug}/checkout?product=${product.id}`}>
                      Pedir
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
