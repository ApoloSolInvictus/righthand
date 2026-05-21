"use client";

import { ChevronLeft, ChevronRight, Megaphone, Store } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Business, BusinessOffer } from "@/lib/types";
import { cn } from "@/lib/utils";

type OffersCarouselProps = {
  initialOffers: BusinessOffer[];
  businesses: Business[];
  businessId?: string;
  title: string;
  subtitle: string;
};

const offersStorageKey = "righthand:offers";

function readStoredOffers() {
  try {
    const stored = window.localStorage.getItem(offersStorageKey);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as BusinessOffer[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function OffersCarousel({
  initialOffers,
  businesses,
  businessId,
  title,
  subtitle,
}: OffersCarouselProps) {
  const [offers, setOffers] = useState(initialOffers);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const storedOffers = readStoredOffers();
    if (storedOffers) {
      setOffers(storedOffers);
    }
  }, []);

  const businessById = useMemo(
    () => new Map(businesses.map((business) => [business.id, business])),
    [businesses],
  );
  const visibleOffers = useMemo(
    () =>
      offers.filter(
        (offer) => offer.active && (!businessId || offer.businessId === businessId),
      ),
    [businessId, offers],
  );
  const activeOffer = visibleOffers[activeIndex % Math.max(visibleOffers.length, 1)];
  const activeBusiness = activeOffer
    ? businessById.get(activeOffer.businessId)
    : null;

  useEffect(() => {
    setActiveIndex(0);
  }, [businessId, visibleOffers.length]);

  function move(direction: -1 | 1) {
    setActiveIndex((current) => {
      if (!visibleOffers.length) {
        return 0;
      }

      return (current + direction + visibleOffers.length) % visibleOffers.length;
    });
  }

  if (!activeOffer || !activeBusiness) {
    return null;
  }

  return (
    <section className="container py-12">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-delivery">Ofertas</p>
          <h2 className="mt-2 text-3xl font-black tracking-normal text-primary md:text-4xl">
            {title}
          </h2>
        </div>
        <p className="max-w-xl text-muted-foreground">{subtitle}</p>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="grid gap-0 p-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div
            className="min-h-[260px] bg-cover bg-center sm:min-h-[340px]"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(8,27,47,.76), rgba(8,27,47,.18)), url('${activeOffer.imageUrl}')`,
            }}
          />
          <div className="flex min-h-[260px] flex-col justify-between gap-6 p-6 sm:p-8">
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge variant="delivery">
                  <Megaphone className="mr-1 h-3 w-3" aria-hidden="true" />
                  Promo activa
                </Badge>
                <Badge variant="secondary">{activeBusiness.name}</Badge>
              </div>
              <h3 className="text-2xl font-black tracking-normal text-primary">
                {activeOffer.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {activeOffer.description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <Button asChild variant="delivery">
                <Link href={`/tienda/${activeBusiness.slug}`}>
                  <Store className="h-4 w-4" aria-hidden="true" />
                  Ver tienda
                </Link>
              </Button>
              {visibleOffers.length > 1 ? (
                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => move(-1)}
                    aria-label="Oferta anterior"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {visibleOffers.map((offer, index) => (
                      <button
                        key={offer.id}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className={cn(
                          "h-2.5 w-2.5 rounded-full bg-muted-foreground/30 transition-colors",
                          index === activeIndex && "bg-delivery",
                        )}
                        aria-label={`Ver oferta ${index + 1}`}
                      />
                    ))}
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => move(1)}
                    aria-label="Oferta siguiente"
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
