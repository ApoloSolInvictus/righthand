"use client";

import {
  Copy,
  ExternalLink,
  ImagePlus,
  Megaphone,
  Palette,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { readFileAsDataUrl, usePersistentState } from "@/lib/local-demo-store";
import { getMarketingFormat, marketingFormats } from "@/lib/marketing";
import type {
  Business,
  BusinessOffer,
  MarketingCampaign,
  MarketingFormatId,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type MarketingStudioProps = {
  business: Business;
  initialCampaigns: MarketingCampaign[];
  initialOffers: BusinessOffer[];
};

type DraftState = {
  title: string;
  campaignGoal: string;
  audience: string;
  offerText: string;
  instructions: string;
  formatId: MarketingFormatId;
  referenceImages: string[];
};

type MarketingApiResponse = {
  source: string;
  result: {
    prompt: string;
    imageUrl: string;
    format: ReturnType<typeof getMarketingFormat>;
    captions: string[];
    hashtags: string[];
  };
};

type CanvaApiResponse = {
  source: string;
  fallbackUrl?: string;
  message?: string;
  designId?: string;
  editUrl?: string;
  viewUrl?: string;
};

const campaignsStorageKey = "righthand:marketing-campaigns";
const offersStorageKey = "righthand:offers";

function createInitialDraft(business: Business): DraftState {
  return {
    title: `Oferta especial ${business.name}`,
    campaignGoal: "Aumentar pedidos esta semana",
    audience: `Clientes en ${business.city} y zonas cercanas`,
    offerText: business.offerSummary,
    instructions:
      "Usa una composicion limpia, colores vivos, producto protagonista y espacio para texto.",
    formatId: "instagram_post",
    referenceImages: [],
  };
}

function isCanvaUploadableDataImage(imageUrl: string) {
  return /^data:image\/(png|jpeg|jpg|webp);base64,/i.test(imageUrl);
}

export function MarketingStudio({
  business,
  initialCampaigns,
  initialOffers,
}: MarketingStudioProps) {
  const [campaigns, setCampaigns] = usePersistentState(
    campaignsStorageKey,
    initialCampaigns,
  );
  const [offers, setOffers] = usePersistentState(offersStorageKey, initialOffers);
  const [draft, setDraft] = useState<DraftState>(() => createInitialDraft(business));
  const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaign | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [canvaLoading, setCanvaLoading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentFormat = getMarketingFormat(
    selectedCampaign?.formatId || draft.formatId,
  );
  const businessCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign.businessId === business.id),
    [business.id, campaigns],
  );
  const latestCampaign = selectedCampaign || businessCampaigns[0] || null;
  const canUseGeneratedImageInCanva = latestCampaign
    ? isCanvaUploadableDataImage(latestCampaign.imageUrl)
    : false;

  async function handleReferenceUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []).slice(0, 4);

    if (!files.length) {
      return;
    }

    const images = await Promise.all(files.map((file) => readFileAsDataUrl(file)));
    setDraft((current) => ({
      ...current,
      referenceImages: [...current.referenceImages, ...images].slice(0, 4),
    }));
    setMessage("Imagenes de referencia listas para la IA.");
  }

  function removeReference(index: number) {
    setDraft((current) => ({
      ...current,
      referenceImages: current.referenceImages.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function generateAd() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/ai/marketing-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: business.name,
          businessStyle: business.businessStyle,
          ...draft,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo generar el anuncio.");
      }

      const data = (await response.json()) as MarketingApiResponse;
      const campaign: MarketingCampaign = {
        id: `mk_${Date.now()}`,
        businessId: business.id,
        title: draft.title,
        campaignGoal: draft.campaignGoal,
        audience: draft.audience,
        offerText: draft.offerText,
        instructions: draft.instructions,
        formatId: draft.formatId,
        imageUrl: data.result.imageUrl,
        referenceImages: draft.referenceImages,
        captions: data.result.captions,
        hashtags: data.result.hashtags,
        createdAt: new Date().toISOString(),
      };

      setCampaigns((current) => [campaign, ...current]);
      setSelectedCampaign(campaign);
      setMessage(
        data.source === "openai"
          ? "Anuncio generado con OpenAI GPT Image."
          : "Anuncio creado en modo local. Agrega OPENAI_API_KEY para imagenes IA reales.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error al crear anuncio.");
    } finally {
      setLoading(false);
    }
  }

  async function createCanvaDesign() {
    const target = latestCampaign;

    if (!target) {
      setMessage("Primero genera o selecciona una campana.");
      return;
    }

    setCanvaLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/canva/create-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${target.title} - ${getMarketingFormat(target.formatId).label}`,
          formatId: target.formatId,
          imageDataUrl: canUseGeneratedImageInCanva ? target.imageUrl : undefined,
        }),
      });
      const data = (await response.json()) as CanvaApiResponse;

      if (!response.ok) {
        throw new Error(data.message || "No se pudo crear el diseno en Canva.");
      }

      if (data.editUrl) {
        setCampaigns((current) =>
          current.map((campaign) =>
            campaign.id === target.id
              ? {
                  ...campaign,
                  canvaDesignId: data.designId,
                  canvaEditUrl: data.editUrl,
                  canvaViewUrl: data.viewUrl,
                }
              : campaign,
          ),
        );
        setSelectedCampaign((current) =>
          current?.id === target.id
            ? {
                ...current,
                canvaDesignId: data.designId,
                canvaEditUrl: data.editUrl,
                canvaViewUrl: data.viewUrl,
              }
            : current,
        );
        window.open(data.editUrl, "_blank", "noreferrer");
        setMessage("Diseno creado en Canva y abierto en una nueva pestana.");
        return;
      }

      if (data.fallbackUrl) {
        setMessage(data.message || "Configura Canva Connect para crear disenos.");
        window.open(data.fallbackUrl, "_blank", "noreferrer");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error conectando Canva.");
    } finally {
      setCanvaLoading(false);
    }
  }

  function saveAsOffer() {
    const target = latestCampaign;

    if (!target) {
      setMessage("Primero genera o selecciona un anuncio.");
      return;
    }

    const offer: BusinessOffer = {
      id: `offer_${Date.now()}`,
      businessId: business.id,
      title: target.title,
      description: target.offerText,
      imageUrl: target.imageUrl,
      active: true,
    };

    setOffers((current) => [offer, ...current]);
    setMessage("Anuncio guardado como oferta publica de la tienda.");
  }

  function deleteCampaign(campaignId: string) {
    setCampaigns((current) => current.filter((campaign) => campaign.id !== campaignId));
    if (selectedCampaign?.id === campaignId) {
      setSelectedCampaign(null);
    }
  }

  async function copyCaption() {
    const target = latestCampaign;
    if (!target) {
      return;
    }

    await navigator.clipboard.writeText(
      `${target.captions[0]}\n\n${target.hashtags.join(" ")}`,
    );
    setMessage("Copy listo para redes sociales.");
  }

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold uppercase text-delivery">
          Marketing Digital
        </p>
        <h1 className="text-3xl font-black tracking-normal text-primary">
          Anuncios IA para {business.name}
        </h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Crea piezas para redes, sube referencias, genera anuncios con IA y abre
          un diseno en Canva para pulir la publicacion final.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-2xl font-black text-primary">{marketingFormats.length}</p>
            <p className="text-sm text-muted-foreground">Formatos sociales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-2xl font-black text-primary">
              {draft.referenceImages.length}/4
            </p>
            <p className="text-sm text-muted-foreground">Referencias subidas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-2xl font-black text-primary">{offers.length}</p>
            <p className="text-sm text-muted-foreground">Ofertas disponibles</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[430px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Brief del anuncio</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="marketingTitle">Titulo</Label>
              <Input
                id="marketingTitle"
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, title: event.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="marketingGoal">Objetivo</Label>
              <Input
                id="marketingGoal"
                value={draft.campaignGoal}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    campaignGoal: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="marketingAudience">Publico</Label>
              <Input
                id="marketingAudience"
                value={draft.audience}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, audience: event.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="marketingOffer">Texto principal</Label>
              <Textarea
                id="marketingOffer"
                value={draft.offerText}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, offerText: event.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="marketingInstructions">Indicaciones visuales</Label>
              <Textarea
                id="marketingInstructions"
                value={draft.instructions}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    instructions: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>Formato</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {marketingFormats.map((format) => (
                  <button
                    key={format.id}
                    type="button"
                    onClick={() =>
                      setDraft((current) => ({ ...current, formatId: format.id }))
                    }
                    className={cn(
                      "rounded-md border p-3 text-left text-sm transition-colors hover:border-primary",
                      draft.formatId === format.id && "border-primary bg-secondary",
                    )}
                  >
                    <span className="font-semibold">{format.label}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {format.width} x {format.height}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Imagenes de referencia</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleReferenceUpload}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
                Subir referencias
              </Button>
              {draft.referenceImages.length ? (
                <div className="grid grid-cols-4 gap-2">
                  {draft.referenceImages.map((image, index) => (
                    <button
                      key={`${image.slice(0, 24)}-${index}`}
                      type="button"
                      className="relative h-20 rounded-md border bg-cover bg-center"
                      style={{ backgroundImage: `url('${image}')` }}
                      onClick={() => removeReference(index)}
                      aria-label={`Quitar referencia ${index + 1}`}
                    >
                      <span className="absolute right-1 top-1 rounded-sm bg-background/90 p-1">
                        <Trash2 className="h-3 w-3" aria-hidden="true" />
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <Button
              type="button"
              variant="delivery"
              onClick={generateAd}
              disabled={loading}
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {loading ? "Generando..." : "Generar anuncio IA"}
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Vista previa</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {currentFormat.label} / {currentFormat.width} x {currentFormat.height}
                </p>
              </div>
              <Badge variant="delivery">
                <Palette className="mr-1 h-3 w-3" aria-hidden="true" />
                Canva ready
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-5 lg:grid-cols-[minmax(260px,420px)_1fr]">
              <div
                className={cn(
                  "w-full rounded-lg border bg-secondary bg-cover bg-center shadow-sm",
                  currentFormat.aspectClass,
                )}
                style={{
                  backgroundImage: latestCampaign
                    ? `url('${latestCampaign.imageUrl}')`
                    : "linear-gradient(135deg, #103A5C, #219E6B 60%, #F97316)",
                }}
                aria-label="Vista previa del anuncio"
              />
              <div className="grid content-start gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase text-delivery">
                    Copy sugerido
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {latestCampaign?.captions[0] ||
                      "Genera un anuncio para ver captions, hashtags y acciones."}
                  </p>
                </div>
                {latestCampaign ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {latestCampaign.hashtags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Button type="button" variant="outline" onClick={copyCaption}>
                        <Copy className="h-4 w-4" aria-hidden="true" />
                        Copiar copy
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={saveAsOffer}
                      >
                        <Megaphone className="h-4 w-4" aria-hidden="true" />
                        Guardar como oferta
                      </Button>
                      <Button
                        type="button"
                        variant="delivery"
                        onClick={createCanvaDesign}
                        disabled={canvaLoading}
                        className="sm:col-span-2"
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        {canvaLoading ? "Conectando Canva..." : "Crear en Canva"}
                      </Button>
                      {latestCampaign.canvaEditUrl ? (
                        <Button asChild type="button" variant="secondary">
                          <a
                            href={latestCampaign.canvaEditUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" aria-hidden="true" />
                            Abrir diseno Canva
                          </a>
                        </Button>
                      ) : null}
                    </div>
                    {!canUseGeneratedImageInCanva ? (
                      <p className="rounded-md bg-secondary p-3 text-xs text-muted-foreground">
                        El mockup local se puede recrear en Canva como lienzo. Las
                        imagenes PNG generadas por OpenAI se suben como asset cuando
                        configures Canva Connect.
                      </p>
                    ) : null}
                  </>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {message ? (
            <p className="rounded-md bg-success/10 p-3 text-sm font-medium text-success">
              {message}
            </p>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Campanas creadas</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {businessCampaigns.map((campaign) => {
                const format = getMarketingFormat(campaign.formatId);
                return (
                  <div
                    key={campaign.id}
                    className="grid gap-3 rounded-md border p-3 md:grid-cols-[120px_1fr_auto]"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedCampaign(campaign)}
                      className={cn(
                        "rounded-md border bg-cover bg-center",
                        format.aspectClass,
                      )}
                      style={{ backgroundImage: `url('${campaign.imageUrl}')` }}
                      aria-label={`Seleccionar ${campaign.title}`}
                    />
                    <div>
                      <div className="mb-2 flex flex-wrap gap-2">
                        <Badge variant="secondary">{format.label}</Badge>
                        {campaign.canvaEditUrl ? (
                          <Badge variant="success">Canva</Badge>
                        ) : null}
                      </div>
                      <p className="font-semibold">{campaign.title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {campaign.offerText}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteCampaign(campaign.id)}
                      aria-label={`Eliminar ${campaign.title}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                );
              })}

              {businessCampaigns.length === 0 ? (
                <p className="rounded-md bg-secondary p-4 text-sm text-muted-foreground">
                  Aun no hay campanas. Genera el primer anuncio de marketing.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
