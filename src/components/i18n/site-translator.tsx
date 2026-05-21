"use client";

import { Check, Globe2, Languages, RotateCcw, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

type TranslatorLanguage = {
  code: string;
  label: string;
};

const quickLanguages: TranslatorLanguage[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
  { code: "zh-CN", label: "Chinese Simplified" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
];

const fallbackLanguages: TranslatorLanguage[] = [
  { code: "af", label: "Afrikaans" },
  { code: "sq", label: "Albanian" },
  { code: "am", label: "Amharic" },
  { code: "ar", label: "Arabic" },
  { code: "hy", label: "Armenian" },
  { code: "az", label: "Azerbaijani" },
  { code: "eu", label: "Basque" },
  { code: "be", label: "Belarusian" },
  { code: "bn", label: "Bengali" },
  { code: "bs", label: "Bosnian" },
  { code: "bg", label: "Bulgarian" },
  { code: "ca", label: "Catalan" },
  { code: "ceb", label: "Cebuano" },
  { code: "zh-CN", label: "Chinese Simplified" },
  { code: "zh-TW", label: "Chinese Traditional" },
  { code: "co", label: "Corsican" },
  { code: "hr", label: "Croatian" },
  { code: "cs", label: "Czech" },
  { code: "da", label: "Danish" },
  { code: "nl", label: "Dutch" },
  { code: "en", label: "English" },
  { code: "eo", label: "Esperanto" },
  { code: "et", label: "Estonian" },
  { code: "tl", label: "Filipino" },
  { code: "fi", label: "Finnish" },
  { code: "fr", label: "French" },
  { code: "fy", label: "Frisian" },
  { code: "gl", label: "Galician" },
  { code: "ka", label: "Georgian" },
  { code: "de", label: "German" },
  { code: "el", label: "Greek" },
  { code: "gu", label: "Gujarati" },
  { code: "ht", label: "Haitian Creole" },
  { code: "ha", label: "Hausa" },
  { code: "haw", label: "Hawaiian" },
  { code: "iw", label: "Hebrew" },
  { code: "hi", label: "Hindi" },
  { code: "hmn", label: "Hmong" },
  { code: "hu", label: "Hungarian" },
  { code: "is", label: "Icelandic" },
  { code: "ig", label: "Igbo" },
  { code: "id", label: "Indonesian" },
  { code: "ga", label: "Irish" },
  { code: "it", label: "Italian" },
  { code: "ja", label: "Japanese" },
  { code: "jw", label: "Javanese" },
  { code: "kn", label: "Kannada" },
  { code: "kk", label: "Kazakh" },
  { code: "km", label: "Khmer" },
  { code: "ko", label: "Korean" },
  { code: "ku", label: "Kurdish" },
  { code: "ky", label: "Kyrgyz" },
  { code: "lo", label: "Lao" },
  { code: "la", label: "Latin" },
  { code: "lv", label: "Latvian" },
  { code: "lt", label: "Lithuanian" },
  { code: "lb", label: "Luxembourgish" },
  { code: "mk", label: "Macedonian" },
  { code: "mg", label: "Malagasy" },
  { code: "ms", label: "Malay" },
  { code: "ml", label: "Malayalam" },
  { code: "mt", label: "Maltese" },
  { code: "mi", label: "Maori" },
  { code: "mr", label: "Marathi" },
  { code: "mn", label: "Mongolian" },
  { code: "my", label: "Myanmar" },
  { code: "ne", label: "Nepali" },
  { code: "no", label: "Norwegian" },
  { code: "ps", label: "Pashto" },
  { code: "fa", label: "Persian" },
  { code: "pl", label: "Polish" },
  { code: "pt", label: "Portuguese" },
  { code: "pa", label: "Punjabi" },
  { code: "ro", label: "Romanian" },
  { code: "ru", label: "Russian" },
  { code: "sm", label: "Samoan" },
  { code: "gd", label: "Scots Gaelic" },
  { code: "sr", label: "Serbian" },
  { code: "st", label: "Sesotho" },
  { code: "sn", label: "Shona" },
  { code: "sd", label: "Sindhi" },
  { code: "si", label: "Sinhala" },
  { code: "sk", label: "Slovak" },
  { code: "sl", label: "Slovenian" },
  { code: "so", label: "Somali" },
  { code: "es", label: "Spanish" },
  { code: "su", label: "Sundanese" },
  { code: "sw", label: "Swahili" },
  { code: "sv", label: "Swedish" },
  { code: "tg", label: "Tajik" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "th", label: "Thai" },
  { code: "tr", label: "Turkish" },
  { code: "uk", label: "Ukrainian" },
  { code: "ur", label: "Urdu" },
  { code: "ug", label: "Uyghur" },
  { code: "uz", label: "Uzbek" },
  { code: "vi", label: "Vietnamese" },
  { code: "cy", label: "Welsh" },
  { code: "xh", label: "Xhosa" },
  { code: "yi", label: "Yiddish" },
  { code: "yo", label: "Yoruba" },
  { code: "zu", label: "Zulu" },
];

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function uniqueLanguages(languages: TranslatorLanguage[]) {
  const seen = new Set<string>();
  return languages
    .filter((language) => {
      if (!language.code || seen.has(language.code)) {
        return false;
      }

      seen.add(language.code);
      return true;
    })
    .sort((left, right) => left.label.localeCompare(right.label));
}

function readLanguagesFromGoogleCombo() {
  const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");

  if (!combo) {
    return [];
  }

  return Array.from(combo.options)
    .filter((option) => option.value)
    .map((option) => ({
      code: option.value,
      label: option.textContent?.trim() || option.value,
    }));
}

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
  const [searchQuery, setSearchQuery] = useState("");
  const [availableLanguages, setAvailableLanguages] = useState<TranslatorLanguage[]>(
    fallbackLanguages,
  );

  const allLanguages = useMemo(
    () => uniqueLanguages([...availableLanguages, ...fallbackLanguages]),
    [availableLanguages],
  );
  const currentLabel = useMemo(
    () =>
      allLanguages.find((language) => language.code === currentLanguage)?.label ||
      (currentLanguage === "es" ? "Spanish" : currentLanguage.toUpperCase()),
    [allLanguages, currentLanguage],
  );
  const filteredLanguages = useMemo(() => {
    const query = normalize(searchQuery);

    if (!query) {
      return allLanguages;
    }

    return allLanguages.filter(
      (language) =>
        normalize(language.label).includes(query) ||
        normalize(language.code).includes(query),
    );
  }, [allLanguages, searchQuery]);

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

      window.setTimeout(() => {
        const googleLanguages = readLanguagesFromGoogleCombo();
        if (googleLanguages.length) {
          setAvailableLanguages(googleLanguages);
        }
        setReady(true);
      }, 700);
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

  useEffect(() => {
    if (!open || !ready) {
      return;
    }

    const googleLanguages = readLanguagesFromGoogleCombo();
    if (googleLanguages.length) {
      setAvailableLanguages(googleLanguages);
    }
  }, [open, ready]);

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
      <div
        id="google_translate_element"
        className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
        aria-hidden="true"
      />

      <Button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="h-14 rounded-full px-5 shadow-xl"
        aria-expanded={open}
        aria-label="Translate site"
      >
        <Globe2 className="h-5 w-5" aria-hidden="true" />
        Translate
      </Button>

      {open ? (
        <div className="fixed bottom-20 left-3 right-3 max-h-[calc(100dvh-6rem)] w-auto overflow-hidden rounded-lg border bg-background shadow-2xl sm:absolute sm:bottom-16 sm:left-0 sm:right-auto sm:max-h-[min(78vh,680px)] sm:w-[min(92vw,380px)]">
          <div className="flex items-center justify-between gap-3 border-b bg-primary p-4 text-primary-foreground">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/15">
                <Languages className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="font-bold">World Translator</p>
                <p className="truncate text-xs text-primary-foreground/80">
                  Current: {currentLabel}
                </p>
              </div>
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-primary-foreground hover:bg-white/15 hover:text-primary-foreground"
              onClick={() => setOpen(false)}
              aria-label="Close translator"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="grid max-h-[calc(100dvh-11rem)] gap-4 overflow-y-auto p-4 sm:max-h-[calc(min(78vh,680px)-73px)]">
            <div className="grid grid-cols-2 gap-2">
              {quickLanguages.map((language) => (
                <Button
                  key={language.code}
                  type="button"
                  variant={currentLanguage === language.code ? "delivery" : "outline"}
                  size="sm"
                  onClick={() => selectLanguage(language.code)}
                  className="justify-start overflow-hidden"
                >
                  {currentLanguage === language.code ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Globe2 className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span className="truncate">{language.label}</span>
                </Button>
              ))}
            </div>

            <div className="rounded-md border bg-secondary/40 p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  All languages
                </p>
                <span className="text-xs text-muted-foreground">
                  {filteredLanguages.length}
                </span>
              </div>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search language"
                  className="pl-9"
                />
              </div>
              <div className="mt-3 grid max-h-[34dvh] gap-2 overflow-y-auto pr-1 sm:max-h-64">
                {filteredLanguages.map((language) => (
                  <Button
                    key={language.code}
                    type="button"
                    variant={currentLanguage === language.code ? "delivery" : "outline"}
                    size="sm"
                    onClick={() => selectLanguage(language.code)}
                    className="justify-start overflow-hidden"
                  >
                    {currentLanguage === language.code ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Globe2 className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span className="truncate">{language.label}</span>
                  </Button>
                ))}
              </div>
              {!ready ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Loading translator engine...
                </p>
              ) : null}
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={() => selectLanguage("es")}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Back to Spanish
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
