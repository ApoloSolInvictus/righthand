"use client";

import {
  Bot,
  Clock,
  Languages,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Navigation,
  Send,
  Store,
  X,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Recommendation = {
  businessName: string;
  storeSlug: string;
  storeUrl: string;
  reason: string;
  location: string;
  hours: string;
  physicalAddress: string;
  wazeUrl: string;
  products: string[];
  deliveryZones: string[];
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  recommendations?: Recommendation[];
  quickReplies?: string[];
};

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hola. I can help in any language. Ask me where to find food, clothes, pharmacy products, delivery areas or store hours in RightHand.",
    quickReplies: [
      "Where can I eat near San Pedro?",
      "Ropa casual en Escazu",
      "Farmacia abierta hoy",
    ],
  },
];

export function StoreConciergeChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const visibleHistory = useMemo(
    () =>
      messages
        .filter((message) => message.id !== "welcome")
        .slice(-8)
        .map((message) => ({
          role: message.role,
          content: message.content,
        })),
    [messages],
  );

  function openChat() {
    setOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 80);
  }

  async function sendMessage(nextInput?: string) {
    const text = (nextInput || input).trim();

    if (!text || loading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/store-concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          path: window.location.pathname,
          history: visibleHistory,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo consultar el concierge.");
      }

      const data = (await response.json()) as {
        result?: {
          answer: string;
          recommendations: Recommendation[];
          quickReplies: string[];
        };
      };

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content:
            data.result?.answer ||
            "Puedo ayudarte a encontrar negocios, productos, horarios y zonas de entrega.",
          recommendations: data.result?.recommendations || [],
          quickReplies: data.result?.quickReplies || [],
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content:
            "Ahora no pude conectar con la IA, pero puedo intentar de nuevo en unos segundos.",
          quickReplies: ["Buscar comida", "Buscar ropa", "Buscar farmacia"],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  return (
    <>
      <Button
        type="button"
        onClick={openChat}
        className={cn(
          "fixed bottom-4 right-4 z-50 h-14 rounded-full px-5 shadow-xl",
          open && "hidden",
        )}
        aria-label="Abrir RightHand Concierge"
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        AI Concierge
      </Button>

      {open ? (
        <Card className="fixed bottom-4 left-4 right-4 z-50 flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden shadow-2xl sm:left-auto sm:w-[430px]">
          <CardHeader className="border-b bg-primary p-4 text-primary-foreground">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/15">
                  <Bot className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base">RightHand Concierge</CardTitle>
                  <p className="truncate text-xs text-primary-foreground/80">
                    AI seller for Costa Rica businesses
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="text-primary-foreground hover:bg-white/15 hover:text-primary-foreground"
                onClick={() => setOpen(false)}
                aria-label="Cerrar chat"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex min-h-0 flex-1 flex-col p-0">
            <div className="flex-1 space-y-4 overflow-y-auto bg-secondary/40 p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "grid gap-3",
                    message.role === "user" && "justify-items-end",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[92%] rounded-md px-4 py-3 text-sm leading-6",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-foreground shadow-sm",
                    )}
                  >
                    {message.content}
                  </div>

                  {message.recommendations?.length ? (
                    <div className="grid w-full gap-3">
                      {message.recommendations.map((recommendation) => (
                        <div
                          key={`${message.id}-${recommendation.storeSlug}`}
                          className="rounded-md border bg-background p-3 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold">
                                {recommendation.businessName}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                {recommendation.reason}
                              </p>
                            </div>
                            <Badge variant="delivery">Match</Badge>
                          </div>

                          <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                              {recommendation.physicalAddress ||
                                recommendation.location}
                            </span>
                            <span className="flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                              {recommendation.hours}
                            </span>
                          </div>

                          {recommendation.products.length ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {recommendation.products.slice(0, 4).map((product) => (
                                <Badge key={product} variant="secondary">
                                  {product}
                                </Badge>
                              ))}
                            </div>
                          ) : null}

                          {recommendation.deliveryZones.length ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {recommendation.deliveryZones
                                .slice(0, 3)
                                .map((zone) => (
                                  <Badge key={zone} variant="outline">
                                    {zone}
                                  </Badge>
                                ))}
                            </div>
                          ) : null}

                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <Button asChild size="sm">
                              <Link href={recommendation.storeUrl}>
                                <Store className="h-4 w-4" aria-hidden="true" />
                                Ver tienda
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="delivery">
                              <a
                                href={recommendation.wazeUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Navigation className="h-4 w-4" aria-hidden="true" />
                                Waze
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {message.quickReplies?.length ? (
                    <div className="flex w-full flex-wrap gap-2">
                      {message.quickReplies.slice(0, 3).map((reply) => (
                        <Button
                          key={`${message.id}-${reply}`}
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => void sendMessage(reply)}
                        >
                          {reply}
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}

              {loading ? (
                <div className="flex items-center gap-2 rounded-md bg-background px-4 py-3 text-sm text-muted-foreground shadow-sm">
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Thinking across languages...
                </div>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="border-t bg-background p-3">
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Languages className="h-3.5 w-3.5" aria-hidden="true" />
                Ask in English, Espanol, Francais, Deutsch, Portugues or any language.
              </div>
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="What are you looking for?"
                  maxLength={800}
                />
                <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Enviar</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
