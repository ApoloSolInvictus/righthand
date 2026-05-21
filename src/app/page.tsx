import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock3,
  MapPinned,
  MessageCircle,
  ShoppingBag,
  Users,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BusinessDirectorySearch } from "@/components/storefront/business-directory-search";
import { OffersCarousel } from "@/components/storefront/offers-carousel";
import { businesses, businessOffers } from "@/lib/mock-data";

const features = [
  {
    title: "Tienda lista para vender",
    description: "Catalogo, carrito, checkout, horarios, zonas y portada por negocio.",
    icon: ShoppingBag,
  },
  {
    title: "CRM para repetir ventas",
    description: "Clientes, etiquetas, cumpleanos, historial, notas y compradores frecuentes.",
    icon: Users,
  },
  {
    title: "Entregas con Waze",
    description: "Mensajeros, asignaciones, estados y enlaces profundos para navegar.",
    icon: MapPinned,
  },
  {
    title: "AI Delivery Manager",
    description: "Prioriza pedidos, agrupa rutas, alerta atrasos y redacta mensajes.",
    icon: Bot,
  },
];

const planHighlights = [
  "Gratis para validar ventas pequenas",
  "PYME con productos ilimitados y CRM",
  "Pro con AI Manager, mensajeros y reportes",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <section
        className="relative min-h-[92vh] overflow-hidden bg-cover bg-center text-white"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(8,27,47,.92), rgba(8,27,47,.66), rgba(8,27,47,.18)), url('https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=1800&q=80')",
        }}
      >
        <div className="container flex min-h-[92vh] flex-col justify-between py-6">
          <header className="flex items-center justify-between gap-4">
            <Link href="/" className="text-xl font-black tracking-normal">
              RightHand
            </Link>
            <nav className="flex items-center gap-2">
              <Button asChild variant="ghost" className="text-white hover:bg-white/12">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="delivery">
                <Link href="/register">Empezar</Link>
              </Button>
            </nav>
          </header>

          <div className="max-w-3xl py-16">
            <p className="mb-4 inline-flex rounded-md bg-white/12 px-3 py-1 text-sm font-semibold backdrop-blur">
              SaaS para PYMES de Costa Rica
            </p>
            <h1 className="text-5xl font-black leading-tight tracking-normal md:text-7xl">
              RightHand
            </h1>
            <p className="mt-4 text-2xl font-semibold text-white/92">
              La mano derecha de tu tienda.
            </p>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/82">
              Vende mejor, entrega mas rapido y organiza clientes con una sola web
              app multi-tenant para tiendas, sodas, farmacias y negocios locales.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="delivery">
                <Link href="/dashboard">
                  Ver demo funcional
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/18"
              >
                <Link href="/tienda/soda-luna">Abrir tienda demo</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 pb-4 sm:grid-cols-3">
            {planHighlights.map((item) => (
              <div
                key={item}
                className="flex min-h-14 items-center gap-2 rounded-md bg-white/12 px-3 text-sm font-medium backdrop-blur"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-delivery">
              MVP completo
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-normal text-primary md:text-4xl">
              Operacion, ventas y entregas en una misma cabina
            </h2>
          </div>
          <p className="max-w-xl text-muted-foreground">
            Pensado para negocios que venden por WhatsApp, Instagram o mostrador y
            necesitan pasar a un flujo ordenado sin comprar cinco herramientas.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-primary">
                  <feature.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y bg-card">
        <div className="container grid gap-8 py-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase text-success">
              Datos demo incluidos
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-normal text-primary">
              Tres negocios ticos para probar de una vez
            </h2>
            <p className="mt-4 text-muted-foreground">
              Soda/restaurante, tienda de ropa y farmacia, con productos, clientes,
              pedidos, zonas y mensajeros.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {businesses.map((business) => (
              <Link
                key={business.id}
                href={`/tienda/${business.slug}`}
                className="rounded-lg border bg-background p-4 transition-colors hover:border-primary"
              >
                <p className="text-sm font-semibold text-delivery">{business.type}</p>
                <h3 className="mt-2 text-lg font-bold">{business.name}</h3>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">
                  {business.city}, {business.province}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {business.businessStyle}: {business.offerSummary}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <OffersCarousel
        initialOffers={businessOffers}
        businesses={businesses}
        title="Ofertas destacadas"
        subtitle="Promociones activas de negocios afiliados para que los clientes encuentren algo bueno desde la primera visita."
      />

      <section className="container grid gap-6 py-16 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>AI Delivery Manager</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {[
              ["Prioridad", "Ordena pedidos por promesa, zona y riesgo de atraso."],
              ["Rutas", "Agrupa entregas compatibles y genera Waze Deep Links."],
              ["Mensajes", "Redacta actualizaciones transaccionales para clientes."],
            ].map(([title, detail]) => (
              <div key={title} className="rounded-md bg-secondary p-4">
                <p className="font-semibold">{title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tiempo importa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p className="flex gap-2">
              <Clock3 className="mt-0.5 h-4 w-4 text-delivery" aria-hidden="true" />
              Detecta pedidos cerca de la hora prometida.
            </p>
            <p className="flex gap-2">
              <MessageCircle
                className="mt-0.5 h-4 w-4 text-success"
                aria-hidden="true"
              />
              WhatsApp queda como soporte transaccional opcional.
            </p>
          </CardContent>
        </Card>
      </section>

      <BusinessDirectorySearch businesses={businesses} />
    </main>
  );
}
