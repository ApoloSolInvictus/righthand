import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { NextResponse } from "next/server";

import {
  DeliveryManagerInputSchema,
  DeliveryManagerResponseSchema,
  heuristicDeliveryPlan,
} from "@/lib/ai/delivery-manager";

function hasUsableOpenAIKey() {
  const key = process.env.OPENAI_API_KEY;
  return Boolean(key && !key.includes("your-key"));
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  let timeout: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(
      () => reject(new Error(`OpenAI request timed out after ${timeoutMs}ms`)),
      timeoutMs,
    );
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeout!);
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = DeliveryManagerInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid delivery manager payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (!hasUsableOpenAIKey()) {
    return NextResponse.json({
      source: "heuristic",
      result: heuristicDeliveryPlan(parsed.data),
    });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS || 15000);
    const response = await withTimeout(
      client.responses.parse({
        model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
        instructions:
          "Eres el AI Delivery Manager de RightHand para PYMES de Costa Rica. Devuelve recomendaciones operativas concretas, conservadoras y accionables. No inventes datos fuera del payload.",
        input: JSON.stringify(parsed.data),
        text: {
          format: zodTextFormat(
            DeliveryManagerResponseSchema,
            "delivery_manager_response",
          ),
        },
      }),
      timeoutMs,
    );

    return NextResponse.json({
      source: "openai",
      result: response.output_parsed || heuristicDeliveryPlan(parsed.data),
    });
  } catch (error) {
    console.error("OpenAI delivery manager failed", error);
    return NextResponse.json({
      source: "heuristic_fallback",
      result: heuristicDeliveryPlan(parsed.data),
    });
  }
}
