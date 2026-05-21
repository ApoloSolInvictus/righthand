"use client";

import { ImagePlus, Navigation, Paintbrush, Save } from "lucide-react";
import { useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { readFileAsDataUrl, usePersistentState } from "@/lib/local-demo-store";
import type { DeliveryZone, Store } from "@/lib/types";
import { crcCurrency } from "@/lib/utils";
import { generateWazeLink } from "@/lib/waze";

type StoreBuilderClientProps = {
  initialStore: Store;
  zones: DeliveryZone[];
};

export function StoreBuilderClient({ initialStore, zones }: StoreBuilderClientProps) {
  const [store, setStore] = usePersistentState("righthand:store", initialStore);
  const [message, setMessage] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const profile: Store = {
    ...initialStore,
    ...store,
    physicalAddress: store.physicalAddress || initialStore.physicalAddress,
    lat: store.lat ?? initialStore.lat,
    lng: store.lng ?? initialStore.lng,
  };
  const wazeLink = generateWazeLink({
    lat: profile.lat,
    lng: profile.lng,
    address: profile.physicalAddress,
  });

  async function handleAsset(file: File | undefined, field: "logoUrl" | "coverUrl") {
    if (!file) {
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    setStore((current) => ({ ...current, [field]: dataUrl }));
    setMessage(field === "logoUrl" ? "Logo actualizado." : "Portada actualizada.");
  }

  function saveStore() {
    setMessage("Cambios guardados en esta demo local.");
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Identidad de tienda</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="storeName">Nombre</Label>
              <Input
                id="storeName"
                value={profile.name}
                onChange={(event) =>
                  setStore((current) => ({ ...current, name: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripcion</Label>
              <Textarea
                id="description"
                value={profile.description}
                onChange={(event) =>
                  setStore((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hours">Horario</Label>
              <Input
                id="hours"
                value={profile.hours}
                onChange={(event) =>
                  setStore((current) => ({ ...current, hours: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="physicalAddress">Direccion para visitar</Label>
              <Textarea
                id="physicalAddress"
                value={profile.physicalAddress}
                onChange={(event) =>
                  setStore((current) => ({
                    ...current,
                    physicalAddress: event.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="lat">Latitud Waze</Label>
                <Input
                  id="lat"
                  type="number"
                  step="0.0000001"
                  value={profile.lat ?? ""}
                  onChange={(event) =>
                    setStore((current) => ({
                      ...current,
                      lat: event.target.value ? Number(event.target.value) : undefined,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lng">Longitud Waze</Label>
                <Input
                  id="lng"
                  type="number"
                  step="0.0000001"
                  value={profile.lng ?? ""}
                  onChange={(event) =>
                    setStore((current) => ({
                      ...current,
                      lng: event.target.value ? Number(event.target.value) : undefined,
                    }))
                  }
                />
              </div>
            </div>
            <Button asChild type="button" variant="outline">
              <a href={wazeLink} target="_blank" rel="noreferrer">
                <Navigation className="h-4 w-4" aria-hidden="true" />
                Probar Waze
              </a>
            </Button>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="grid gap-2">
                <Label>Azul profundo</Label>
                <Input
                  type="color"
                  value={profile.primaryColor}
                  onChange={(event) =>
                    setStore((current) => ({
                      ...current,
                      primaryColor: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Verde exito</Label>
                <Input
                  type="color"
                  value={profile.successColor}
                  onChange={(event) =>
                    setStore((current) => ({
                      ...current,
                      successColor: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Acento entregas</Label>
                <Input
                  type="color"
                  value={profile.deliveryColor}
                  onChange={(event) =>
                    setStore((current) => ({
                      ...current,
                      deliveryColor: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <input
              ref={logoInputRef}
              className="hidden"
              type="file"
              accept="image/*"
              onChange={(event) => handleAsset(event.target.files?.[0], "logoUrl")}
            />
            <input
              ref={coverInputRef}
              className="hidden"
              type="file"
              accept="image/*"
              onChange={(event) => handleAsset(event.target.files?.[0], "coverUrl")}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => logoInputRef.current?.click()}
              >
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
                Subir logo
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => coverInputRef.current?.click()}
              >
                <Paintbrush className="h-4 w-4" aria-hidden="true" />
                Cambiar portada
              </Button>
            </div>
            <Button type="button" onClick={saveStore}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Guardar cambios
            </Button>
            {message ? (
              <p className="rounded-md bg-success/10 p-3 text-sm font-medium text-success">
                {message}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <img src={profile.coverUrl} alt="" className="h-44 w-full object-cover" />
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <img
                src={profile.logoUrl}
                alt=""
                className="h-14 w-14 rounded-md object-cover"
              />
              <div>
                <h2 className="font-bold">{profile.name}</h2>
                <p className="text-sm text-muted-foreground">/{profile.slug}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{profile.description}</p>
            <p className="mt-3 text-sm font-medium text-primary">
              {profile.physicalAddress}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="success">Publicado</Badge>
              <Badge variant="delivery">Express</Badge>
            </div>
            <Button asChild className="mt-4 w-full" size="sm" variant="delivery">
              <a href={wazeLink} target="_blank" rel="noreferrer">
                <Navigation className="h-4 w-4" aria-hidden="true" />
                Abrir en Waze
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Horarios y zonas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-md border p-4">
            <p className="font-semibold">Horario actual</p>
            <p className="mt-2 text-sm text-muted-foreground">{profile.hours}</p>
          </div>
          <div className="grid gap-3">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="flex items-center justify-between rounded-md border p-4"
              >
                <div>
                  <p className="font-semibold">{zone.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ETA {zone.etaMinutes} min
                  </p>
                </div>
                <Badge variant="secondary">{crcCurrency(zone.fee)}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
