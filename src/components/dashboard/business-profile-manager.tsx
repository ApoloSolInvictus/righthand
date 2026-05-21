"use client";

import { MapPinned, Save, Search, Store } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  businessCategories,
  businessCategoryLabels,
  costaRicaProvinces,
  formatSearchTags,
  normalizeBusinessCategory,
  parseSearchTags,
} from "@/lib/business-profile";
import { usePersistentState } from "@/lib/local-demo-store";
import type { Business } from "@/lib/types";

type BusinessProfileManagerProps = {
  initialBusiness: Business;
};

export function BusinessProfileManager({
  initialBusiness,
}: BusinessProfileManagerProps) {
  const [business, setBusiness, hydrated] = usePersistentState(
    "righthand:business-profile",
    initialBusiness,
  );
  const [message, setMessage] = useState("");
  const [tagsText, setTagsText] = useState(() => formatSearchTags(initialBusiness.searchTags));
  const profile: Business = {
    ...initialBusiness,
    ...business,
    type: normalizeBusinessCategory(business.type),
    province: business.province || initialBusiness.province,
    city: business.city || initialBusiness.city,
    businessStyle: business.businessStyle || initialBusiness.businessStyle,
    offerSummary: business.offerSummary || initialBusiness.offerSummary,
    searchTags: business.searchTags?.length ? business.searchTags : initialBusiness.searchTags,
  };

  useEffect(() => {
    if (hydrated) {
      setTagsText(formatSearchTags(profile.searchTags));
    }
  }, [hydrated, profile.searchTags]);

  function saveProfile() {
    setBusiness((current) => ({
      ...current,
      searchTags: parseSearchTags(tagsText),
    }));
    setMessage("Perfil comercial actualizado en esta demo local.");
  }

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold uppercase text-delivery">
          Perfil comercial
        </p>
        <h1 className="text-3xl font-black tracking-normal text-primary">
          Buscador y ficha del negocio
        </h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Estos datos alimentan el buscador del landing y la presentacion publica
          de la tienda.
        </p>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Datos para descubrir tu negocio</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="businessName">Nombre comercial</Label>
              <Input
                id="businessName"
                value={profile.name}
                onChange={(event) =>
                  setBusiness((current) => ({ ...current, name: event.target.value }))
                }
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="province">Provincia</Label>
                <select
                  id="province"
                  value={profile.province}
                  onChange={(event) =>
                    setBusiness((current) => ({
                      ...current,
                      province: event.target.value,
                    }))
                  }
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {costaRicaProvinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={profile.city}
                  onChange={(event) =>
                    setBusiness((current) => ({ ...current, city: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="businessCategory">Tipo de negocio</Label>
              <select
                id="businessCategory"
                value={profile.type}
                onChange={(event) =>
                  setBusiness((current) => ({
                    ...current,
                    type: normalizeBusinessCategory(event.target.value),
                  }))
                }
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {businessCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="businessStyle">Estilo o especialidad</Label>
              <Input
                id="businessStyle"
                value={profile.businessStyle}
                onChange={(event) =>
                  setBusiness((current) => ({
                    ...current,
                    businessStyle: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="offerSummary">Que ofrece</Label>
              <Textarea
                id="offerSummary"
                value={profile.offerSummary}
                onChange={(event) =>
                  setBusiness((current) => ({
                    ...current,
                    offerSummary: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="searchTags">Palabras clave</Label>
              <Input
                id="searchTags"
                value={tagsText}
                onChange={(event) => setTagsText(event.target.value)}
              />
            </div>

            <Button type="button" onClick={saveProfile}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Guardar perfil
            </Button>

            {message ? (
              <p className="rounded-md bg-success/10 p-3 text-sm font-medium text-success">
                {message}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-primary">
              <Store className="h-5 w-5" aria-hidden="true" />
            </div>
            <CardTitle>{profile.name}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="delivery">{businessCategoryLabels[profile.type]}</Badge>
              <Badge variant="secondary">
                <MapPinned className="mr-1 h-3 w-3" aria-hidden="true" />
                {profile.city}, {profile.province}
              </Badge>
            </div>
            <div>
              <p className="font-semibold">{profile.businessStyle}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {profile.offerSummary}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {parseSearchTags(tagsText).map((tag) => (
                <Badge key={tag} variant="outline">
                  <Search className="mr-1 h-3 w-3" aria-hidden="true" />
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
