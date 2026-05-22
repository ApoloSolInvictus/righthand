import { NextResponse } from "next/server";

import {
  CanvaCreateDesignInputSchema,
  getMarketingFormat,
} from "@/lib/marketing";

export const runtime = "nodejs";

type CanvaUploadJob = {
  job?: {
    id: string;
    status: "failed" | "in_progress" | "success";
    error?: { message?: string };
    asset?: { id: string };
  };
};

type CanvaDesignResponse = {
  design?: {
    id: string;
    urls?: {
      edit_url?: string;
      view_url?: string;
    };
  };
};

function hasCanvaToken() {
  const token = process.env.CANVA_ACCESS_TOKEN;
  return Boolean(token && !token.includes("your-token"));
}

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (!match) {
    throw new Error("Invalid Canva asset data URL");
  }

  return Buffer.from(match[2], "base64");
}

function encodeAssetName(name: string) {
  return Buffer.from(name.slice(0, 50)).toString("base64");
}

async function waitForAssetUpload(jobId: string, token: string) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 900));

    const response = await fetch(
      `https://api.canva.com/rest/v1/asset-uploads/${jobId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = (await response.json()) as CanvaUploadJob;
    const job = data.job;

    if (job?.status === "success" && job.asset?.id) {
      return job.asset.id;
    }

    if (job?.status === "failed") {
      throw new Error(job.error?.message || "Canva asset upload failed");
    }
  }

  return null;
}

async function uploadAssetToCanva({
  imageDataUrl,
  title,
  token,
}: {
  imageDataUrl: string;
  title: string;
  token: string;
}) {
  const imageBuffer = parseDataUrl(imageDataUrl);
  const response = await fetch("https://api.canva.com/rest/v1/asset-uploads", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Asset-Upload-Metadata": JSON.stringify({
        name_base64: encodeAssetName(title),
      }),
      "Content-Type": "application/octet-stream",
    },
    body: imageBuffer,
  });
  const data = (await response.json()) as CanvaUploadJob;
  const job = data.job;

  if (!response.ok || !job) {
    throw new Error("Canva asset upload request failed");
  }

  if (job.status === "success" && job.asset?.id) {
    return job.asset.id;
  }

  if (job.status === "failed") {
    throw new Error(job.error?.message || "Canva asset upload failed");
  }

  return waitForAssetUpload(job.id, token);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = CanvaCreateDesignInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid Canva design payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const format = getMarketingFormat(parsed.data.formatId);

  if (!hasCanvaToken()) {
    return NextResponse.json({
      source: "setup_required",
      fallbackUrl: "https://www.canva.com/create/",
      message:
        "Agrega CANVA_ACCESS_TOKEN con scopes asset:write, asset:read y design:content:write para crear disenos desde RightHand.",
      format,
    });
  }

  const token = process.env.CANVA_ACCESS_TOKEN!;

  try {
    const assetId = parsed.data.imageDataUrl
      ? await uploadAssetToCanva({
          imageDataUrl: parsed.data.imageDataUrl,
          title: parsed.data.title,
          token,
        })
      : null;
    const response = await fetch("https://api.canva.com/rest/v1/designs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "type_and_asset",
        design_type: {
          type: "custom",
          width: format.width,
          height: format.height,
        },
        ...(assetId ? { asset_id: assetId } : {}),
        title: parsed.data.title,
      }),
    });
    const data = (await response.json()) as CanvaDesignResponse;

    if (!response.ok || !data.design) {
      return NextResponse.json(
        { error: "Canva design creation failed", details: data },
        { status: 502 },
      );
    }

    return NextResponse.json({
      source: "canva_connect",
      designId: data.design.id,
      assetId,
      editUrl: data.design.urls?.edit_url,
      viewUrl: data.design.urls?.view_url,
      format,
    });
  } catch (error) {
    console.error("Canva create design failed", error);
    return NextResponse.json(
      {
        error: "Canva create design failed",
        message: error instanceof Error ? error.message : "Unknown Canva error",
      },
      { status: 502 },
    );
  }
}
