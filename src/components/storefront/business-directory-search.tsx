"use client";

import { MapPinned, Search, Store } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  businessCategories,
  businessCategoryLabels,
  costaRicaProvinces,
} from "@/lib/business-profile";
import type { Business, BusinessCategory } from "@/lib/types";

type BusinessDirectorySearchProps = {
  businesses: Business[];
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function BusinessDirectorySearch({
  businesses,
}: BusinessDirectorySearchProps) {
  const [query, setQuery] = useState("");
  const [province, setProvince] = useState("");
  const [category, setCategory] = useState("");

  const cities = useMemo(
    () =>
      Array.from(new Set(businesses.map((business) => business.city)))
        .filter(Boolean)
        .sort(),
    [businesses],
  );
  const [city, setCity] = useState("");

  const filteredBusinesses = useMemo(() => {
    const normalizedQuery = normalize(query.trim());

    return businesses.filter((business) => {
      const haystack = normalize(
        [
          business.name,
          business.description,
          business.province,
          business.city,
          business.type,
          business.businessStyle,
          business.offerSummary,
          business.searchTags.join(" "),
        ].join(" "),
      );

      return (
        (!normalizedQuery || haystack.includes(normalizedQuery)) &&
        (!province || business.province === province) &&
        (!city || business.city === city) &&
        (!category || business.type === category)
      );
    });
  }, [businesses, category, city, province, query]);

  return (
    <section className="container py-16">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-delivery">
            Buscador local
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-normal text-primary md:text-4xl">
            Encuentra tiendas y negocios por zona
          </h2>
        </div>
        <p className="max-w-xl text-muted-foreground">
          Filtra por provincia, ciudad, tipo de negocio, nombre, estilo y lo que
          ofrecen las PYMES dentro de RightHand.
        </p>
      </div>

      <Card>
        <CardContent className="grid gap-3 p-4 lg:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre, comida, ropa, producto o servicio"
              className="pl-9"
            />
          </div>
          <select
            value={province}
            onChange={(event) => {
              setProvince(event.target.value);
              setCity("");
            }}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            aria-label="Provincia"
          >
            <option value="">Todas las provincias</option>
            {costaRicaProvinces.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            aria-label="Ciudad"
          >
            <option value="">Todas las ciudades</option>
            {cities
              .filter(
                (item) =>
                  !province ||
                  businesses.some(
                    (business) =>
                      business.city === item && business.province === province,
                  ),
              )
              .map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
          </select>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            aria-label="Tipo de negocio"
          >
            <option value="">Todos los tipos</option>
            {businessCategories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredBusinesses.map((business) => (
          <Card key={business.id}>
            <CardHeader>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant="delivery">
                  {businessCategoryLabels[business.type as BusinessCategory]}
                </Badge>
                <Badge variant="secondary">
                  <MapPinned className="mr-1 h-3 w-3" aria-hidden="true" />
                  {business.city}, {business.province}
                </Badge>
              </div>
              <CardTitle>{business.name}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <p className="text-sm font-semibold">{business.businessStyle}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {business.offerSummary}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {business.searchTags.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Button asChild variant="outline">
                <Link href={`/tienda/${business.slug}`}>
                  <Store className="h-4 w-4" aria-hidden="true" />
                  Ver tienda
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBusinesses.length === 0 ? (
        <p className="mt-5 rounded-md bg-secondary p-4 text-sm text-muted-foreground">
          No hay negocios con esos filtros todavia.
        </p>
      ) : null}
    </section>
  );
}
