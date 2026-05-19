import { NextResponse } from "next/server";

import { getIntegrationStatus } from "@/lib/integrations/status";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getIntegrationStatus());
}
