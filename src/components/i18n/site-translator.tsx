"use client";

import { Check, Globe2, Languages, RotateCcw, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            autoDisplay?: boolean;
            layout?: unknown;
          },
          elementId: string,
        ) => void;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

const quickLanguages = [
  { code: "en", label: "English" },
  { code: "fr", label: "Francais" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Portugues" },
  { code: "zh-CN", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
];

function setGoogleTranslateCookie(languageCode: string) {
  const value = languageCode === "es" ? "" : `/es/${languageCode}`;
  const hostname = window.location.hostname;
  const domains = [
    "",
    hostname,
    hostname.includes(".") ? `.${hostname.split(".").slice(-2).join(".")}` : "",
  ].filter(Boolean);

  if (!value) {
    document.cookie =
      "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    domains.forEach((domain) => {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
    });
    return;
  }

  document.cookie = `googtrans=${value}; path=/; max-age=31536000`;
  domains.forEach((domain) => {
    document.cookie = `googtrans=${value}; path=/; max-age=31536000; domain=${domain}`;
  });
}

function readCurrentLanguage() {
  if (typeof document === "undefined") {
    return "es";
  }

  const match = document.cookie.match(/(?:^|;\s*)googtrans=\/es\/([^;]+)/);
  return match?.[1] || "es";
}

export function SiteTranslator() {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("es");
  const currentLabel = useMemo(
    () =>
      quickLanguages.find((language) => language.code === currentLanguage)?.label ||
      (currentLanguage === "es" ? "Espanol" : currentLanguage.toUpperCase()),
    [currentLanguage],
  );

  useEffect(() => {
    setCurrentLanguage(readCurrentLanguage());

    window.googleTranslateElementInit = () => {
      if (!window.google?.translate) {
        return;
      }

      new window.google.translate.TranslateElement(
        {
          pageLanguage: "es",
          autoDisplay: false,
        },
        "google_translate_element",
      );
      setReady(true);
    };

    if (document.querySelector("#google-translate-script")) {
      window.googleTranslateElementInit();
      return;
    }

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  function selectLanguage(languageCode: string) {
    const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    setGoogleTranslateCookie(languageCode);
    setCurrentLanguage(languageCode);

    if (combo && languageCode !== "es") {
      combo.value = languageCode;
      combo.dispatchEvent(new Event("change"));
      return;
    }

    window.location.reload();
  }

  return (
    <div className="no-print fixed bottom-4 left-4 z-50">
      <Button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="h-14 rounded-full px-5 shadow-xl"
        aria-expanded={open}
        aria-label="Traducir sitio"
      >
        <Globe2 className="h-5 w-5" aria-hidden="true" />
        Traducir
      </Button>

      {open ? (
        <div className="absolute bottom-16 left-0 w-[min(92vw,360px)] overflow-hidden rounded-lg border bg-background shadow-2xl">
          <div className="flex items-center justify-between gap-3 border-b bg-primary p-4 text-primary-foreground">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/15">
                <Languages className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="font-bold">Traductor mundial</p>
                <p className="truncate text-xs text-primary-foreground/80">
                  Actual: {currentLabel}
                </p>
              </div>
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-primary-foreground hover:bg-white/15 hover:text-primary-foreground"
              onClick={() => setOpen(false)}
              aria-label="Cerrar traductor"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="grid gap-4 p-4">
            <div className="grid grid-cols-2 gap-2">
              {quickLanguages.map((language) => (
                <Button
                  key={language.code}
                  type="button"
                  variant={currentLanguage === language.code ? "delivery" : "outline"}
                  size="sm"
                  onClick={() => selectLanguage(language.code)}
                  className="justify-start"
                >
                  {currentLanguage === language.code ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Globe2 className="h-4 w-4" aria-hidden="true" />
                  )}
                  {language.label}
                </Button>
              ))}
            </div>

            <div className="rounded-md border bg-secondary/40 p-3">
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                Todos los idiomas
              </p>
              <div
                id="google_translate_element"
                className={cn(
                  "min-h-10 text-sm",
                  !ready && "flex items-center text-muted-foreground",
                )}
              >
                {!ready ? "Cargando traductor..." : null}
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={() => selectLanguage("es")}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Volver a Espanol
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

