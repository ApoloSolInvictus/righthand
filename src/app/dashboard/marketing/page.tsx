import { MarketingStudio } from "@/components/dashboard/marketing-studio";
import { PlanUpgradeCard } from "@/components/dashboard/plan-upgrade-card";
import { getCurrentAccount } from "@/lib/account-context";
import {
  businessOffers,
  getBusinessDataset,
  getPrimaryBusiness,
  marketingCampaigns,
} from "@/lib/mock-data";
import { canUseFeature } from "@/lib/plans";

export default async function MarketingPage() {
  const account = await getCurrentAccount();

  if (!canUseFeature(account.plan, "marketing")) {
    return <PlanUpgradeCard feature="marketing" currentPlan={account.plan} />;
  }

  const fallbackBusiness = getPrimaryBusiness();
  const dataset = getBusinessDataset(account.businessId || fallbackBusiness.id);

  return (
    <MarketingStudio
      business={dataset.business}
      initialCampaigns={marketingCampaigns}
      initialOffers={businessOffers}
    />
  );
}
