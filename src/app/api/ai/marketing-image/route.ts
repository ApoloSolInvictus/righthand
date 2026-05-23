import OpenAI, { toFile } from "openai";
import { NextResponse } from "next/server";

import { getCurrentAccount } from "@/lib/account-context";
import {
  MarketingImageInputSchema,
  type MarketingImageInput,
  type MarketingImageResult,
  getMarketingFormat,
} from "@/lib/marketing";
import { canUseFeature, featureRules, planDetails } from "@/lib/plans";

export const runtime = "nodejs";

function hasUsableOpenAIKey() {
  const key = process.env.OPENAI_API_KEY;
  return Boolean(key && !key.includes("your-key"));
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  let timeout: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(
      () => reject(new Error(`OpenAI image request timed out after ${timeoutMs}ms`)),
      timeoutMs,
    );
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeout!);
  }
}

function buildPrompt(input: MarketingImageInput) {
  const format = getMarketingFormat(input.formatId);

  return [
    `Create a polished digital advertisement for ${input.businessName}.`,
    `Business style: ${input.businessStyle}.`,
    `Campaign title: ${input.title}.`,
    `Goal: ${input.campaignGoal}.`,
    `Audience: ${input.audience}.`,
    `Core offer text: ${input.offerText}.`,
    `Format: ${format.label}, ${format.width}x${format.height}px.`,
    "Visual direction: modern, clean, professional, trustworthy for Costa Rica small businesses.",
    "Use strong composition, readable empty space for final copy, and avoid fake logos or real personal data.",
    input.instructions ? `Extra instructions: ${input.instructions}.` : "",
    input.referenceImages.length
      ? "Use the uploaded reference images for product, mood, colors or brand cues."
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function makeCaptions(input: MarketingImageInput) {
  return [
    `${input.title}: ${input.offerText}`,
    `Hoy es buen momento para probar ${input.businessName}. ${input.campaignGoal}.`,
    `${input.businessName} te lo pone facil: ${input.offerText}`,
  ];
}

function makeHashtags(input: MarketingImageInput) {
  const normalizedBusiness = input.businessName.replace(/[^a-z0-9]/gi, "");
  const normalizedGoal = input.campaignGoal
    .split(/\s+/)
    .slice(0, 2)
    .join("")
    .replace(/[^a-z0-9]/gi, "");

  return [
    "#RightHandCR",
    normalizedBusiness ? `#${normalizedBusiness}` : "#PymeCR",
    normalizedGoal ? `#${normalizedGoal}` : "#MarketingDigital",
    "#CostaRica",
  ];
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(value: string, maxLength: number) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) {
    lines.push(current);
  }

  return lines.slice(0, 4);
}

function fallbackImage(input: MarketingImageInput) {
  const format = getMarketingFormat(input.formatId);
  const titleLines = wrapText(input.title, 22);
  const offerLines = wrapText(input.offerText, 34);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${format.width}" height="${format.height}" viewBox="0 0 ${format.width} ${format.height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#103A5C"/>
      <stop offset="58%" stop-color="#176B5B"/>
      <stop offset="100%" stop-color="#F97316"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect x="${format.width * 0.07}" y="${format.height * 0.08}" width="${format.width * 0.86}" height="${format.height * 0.84}" rx="28" fill="rgba(255,255,255,.92)"/>
  <text x="${format.width * 0.12}" y="${format.height * 0.18}" fill="#F97316" font-family="Arial, sans-serif" font-size="${Math.max(24, format.width * 0.03)}" font-weight="700">${escapeXml(input.businessName)}</text>
  ${titleLines
    .map(
      (line, index) =>
        `<text x="${format.width * 0.12}" y="${format.height * (0.31 + index * 0.065)}" fill="#103A5C" font-family="Arial, sans-serif" font-size="${Math.max(38, format.width * 0.07)}" font-weight="900">${escapeXml(line)}</text>`,
    )
    .join("")}
  ${offerLines
    .map(
      (line, index) =>
        `<text x="${format.width * 0.12}" y="${format.height * (0.62 + index * 0.045)}" fill="#334155" font-family="Arial, sans-serif" font-size="${Math.max(20, format.width * 0.032)}" font-weight="600">${escapeXml(line)}</text>`,
    )
    .join("")}
  <rect x="${format.width * 0.12}" y="${format.height * 0.78}" width="${format.width * 0.38}" height="${format.height * 0.075}" rx="18" fill="#F97316"/>
  <text x="${format.width * 0.15}" y="${format.height * 0.83}" fill="#fff" font-family="Arial, sans-serif" font-size="${Math.max(18, format.width * 0.028)}" font-weight="800">Pedir ahora</text>
  <text x="${format.width * 0.12}" y="${format.height * 0.89}" fill="#64748B" font-family="Arial, sans-serif" font-size="${Math.max(16, format.width * 0.024)}" font-weight="700">Creado con RightHand Marketing</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (!match) {
    throw new Error("Invalid reference image data URL");
  }

  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

async function referenceImagesToFiles(referenceImages: string[]) {
  return Promise.all(
    referenceImages.map(async (dataUrl, index) => {
      const { mimeType, buffer } = parseDataUrl(dataUrl);
      const extension = mimeType.split("/")[1] || "png";
      return toFile(buffer, `reference-${index + 1}.${extension}`, {
        type: mimeType,
      });
    }),
  );
}

function fallbackResult(input: MarketingImageInput): MarketingImageResult {
  return {
    prompt: buildPrompt(input),
    imageUrl: fallbackImage(input),
    format: getMarketingFormat(input.formatId),
    captions: makeCaptions(input),
    hashtags: makeHashtags(input),
  };
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = MarketingImageInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid marketing image payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const account = await getCurrentAccount();

  if (!canUseFeature(account.plan, "marketing")) {
    const requiredPlan = planDetails[featureRules.marketing.minimumPlan].label;

    return NextResponse.json(
      {
        error: `Marketing Digital requiere Plan ${requiredPlan}`,
        plan: planDetails[account.plan].label,
        requiredPlan,
      },
      { status: 403 },
    );
  }

  const prompt = buildPrompt(input);

  if (!hasUsableOpenAIKey()) {
    return NextResponse.json({
      source: "local_mockup",
      result: fallbackResult(input),
    });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const format = getMarketingFormat(input.formatId);

  try {
    const timeoutMs = Number(
      process.env.OPENAI_IMAGE_TIMEOUT_MS || process.env.OPENAI_TIMEOUT_MS || 120000,
    );
    const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";
    const response = input.referenceImages.length
      ? await withTimeout(
          client.images.edit({
            model,
            image: await referenceImagesToFiles(input.referenceImages),
            prompt,
            size: format.imageSize,
            quality: "medium",
          } as never),
          timeoutMs,
        )
      : await withTimeout(
          client.images.generate({
            model,
            prompt,
            size: format.imageSize,
            quality: "medium",
          } as never),
          timeoutMs,
        );

    const imageBase64 = response.data?.[0]?.b64_json;

    if (!imageBase64) {
      throw new Error("OpenAI image response did not include image data.");
    }

    return NextResponse.json({
      source: "openai",
      result: {
        prompt,
        imageUrl: `data:image/png;base64,${imageBase64}`,
        format,
        captions: makeCaptions(input),
        hashtags: makeHashtags(input),
      } satisfies MarketingImageResult,
    });
  } catch (error) {
    console.error("OpenAI marketing image failed", error);
    return NextResponse.json({
      source: "local_fallback",
      result: fallbackResult(input),
    });
  }
}
