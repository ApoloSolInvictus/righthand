import { LockKeyhole, Sparkles } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { featureRules, planDetails, type DashboardFeature } from "@/lib/plans";
import type { SubscriptionPlan } from "@/lib/types";

export function PlanUpgradeCard({
  feature,
  currentPlan,
}: {
  feature: DashboardFeature;
  currentPlan: SubscriptionPlan;
}) {
  const rule = featureRules[feature];
  const requiredPlan = planDetails[rule.minimumPlan];

  return (
    <div className="grid min-h-[55vh] place-items-center">
      <Card className="max-w-xl border-delivery/40">
        <CardHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-delivery/10 text-delivery">
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
          </div>
          <CardTitle>{rule.label} esta incluido en {requiredPlan.label}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm leading-6 text-muted-foreground">{rule.description}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Plan actual: {planDetails[currentPlan].label}</Badge>
            <Badge variant="delivery">Requiere {requiredPlan.label}</Badge>
          </div>
          <Button asChild variant="delivery">
            <Link href="/dashboard/billing">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Activar plan
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
