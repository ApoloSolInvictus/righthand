"use client";

import { ImagePlus, Megaphone, Save, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { readFileAsDataUrl, usePersistentState } from "@/lib/local-demo-store";
import type { BusinessOffer } from "@/lib/types";

type OffersManagerProps = {
  businessId: string;
  businessName: string;
  initialOffers: BusinessOffer[];
};

const offersStorageKey = "righthand:offers";

const emptyDraft = {
  title: "",
  description: "",
  imageUrl: "",
};

export function OffersManager({
  businessId,
  businessName,
  initialOffers,
}: OffersManagerProps) {
  const [offers, setOffers] = usePersistentState(offersStorageKey, initialOffers);
  const [draft, setDraft] = useState(emptyDraft);
  const [message, setMessage] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const businessOffers = useMemo(
    () => offers.filter((offer) => offer.businessId === businessId),
    [businessId, offers],
  );
  const canCreate = Boolean(
    draft.title.trim() && draft.description.trim() && draft.imageUrl,
  );

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // TODO production: upload to Supabase Storage and store the public URL.
    const imageUrl = await readFileAsDataUrl(file);
    setDraft((current) => ({ ...current, imageUrl }));
    setMessage("Imagen lista para guardar en la oferta.");
  }

  function createOffer() {
    if (!canCreate) {
      setMessage("Completa titulo, descripcion e imagen antes de publicar.");
      return;
    }

    const offer: BusinessOffer = {
      id: `offer_${Date.now()}`,
      businessId,
      title: draft.title.trim(),
      description: draft.description.trim(),
      imageUrl: draft.imageUrl,
      active: true,
    };

    setOffers((current) => [offer, ...current]);
    setDraft(emptyDraft);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
    setMessage("Oferta publicada en esta demo local.");
  }

  function toggleOffer(offerId: string) {
    setOffers((current) =>
      current.map((offer) =>
        offer.id === offerId ? { ...offer, active: !offer.active } : offer,
      ),
    );
  }

  function deleteOffer(offerId: string) {
    setOffers((current) => current.filter((offer) => offer.id !== offerId));
  }

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold uppercase text-delivery">Ofertas</p>
        <h1 className="text-3xl font-black tracking-normal text-primary">
          Promociones de {businessName}
        </h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Crea promociones con texto e imagen. Aparecen en el landing y en la
          tienda publica del negocio para todos los planes.
        </p>
      </div>

      <section className="grid gap-4 lg:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Nueva oferta</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="offerTitle">Titulo</Label>
              <Input
                id="offerTitle"
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="Ej. Combo de temporada"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="offerDescription">Texto de la oferta</Label>
              <Textarea
                id="offerDescription"
                value={draft.description}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Describe la promocion, condiciones y beneficio."
              />
            </div>

            <div className="grid gap-2">
              <Label>Imagen</Label>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => imageInputRef.current?.click()}
              >
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
                Subir imagen
              </Button>
              {draft.imageUrl ? (
                <div
                  className="h-40 rounded-md border bg-cover bg-center"
                  style={{ backgroundImage: `url('${draft.imageUrl}')` }}
                  aria-label="Vista previa de la oferta"
                />
              ) : null}
            </div>

            <Button type="button" onClick={createOffer} disabled={!canCreate}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Publicar oferta
            </Button>

            {message ? (
              <p className="rounded-md bg-success/10 p-3 text-sm font-medium text-success">
                {message}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {businessOffers.map((offer) => (
            <Card key={offer.id} className="overflow-hidden">
              <CardContent className="grid gap-0 p-0 md:grid-cols-[240px_1fr]">
                <div
                  className="min-h-[180px] bg-cover bg-center"
                  style={{ backgroundImage: `url('${offer.imageUrl}')` }}
                  aria-label={offer.title}
                />
                <div className="grid gap-4 p-5">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <div className="mb-2 flex flex-wrap gap-2">
                        <Badge variant={offer.active ? "success" : "secondary"}>
                          {offer.active ? "Activa" : "Pausada"}
                        </Badge>
                        <Badge variant="delivery">
                          <Megaphone className="mr-1 h-3 w-3" aria-hidden="true" />
                          Oferta
                        </Badge>
                      </div>
                      <h2 className="text-xl font-black tracking-normal text-primary">
                        {offer.title}
                      </h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => toggleOffer(offer.id)}
                      >
                        {offer.active ? "Pausar" : "Activar"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteOffer(offer.id)}
                        aria-label={`Eliminar ${offer.title}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {offer.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}

          {businessOffers.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Todavia no hay ofertas publicadas para este negocio.
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}
