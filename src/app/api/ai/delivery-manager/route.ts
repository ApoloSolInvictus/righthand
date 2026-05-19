import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { NextResponse } from "next/server";

import {
  DeliveryManagerInputSchema,
  DeliveryManagerResponseSchema,
  heuristicDeliveryPlan,
} from "@/lib/ai/delivery-manager";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = DeliveryManagerInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid delivery manager payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      source: "heuristic",
      result: heuristicDeliveryPlan(parsed.data),
    });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const response = await client.responses.parse({
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
    });

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
