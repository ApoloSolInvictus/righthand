import { MarketingStudio } from "@/components/dashboard/marketing-studio";
import { getCurrentAccount } from "@/lib/account-context";
import {
  businessOffers,
  getBusinessDataset,
  getPrimaryBusiness,
  marketingCampaigns,
} from "@/lib/mock-data";

export default async function MarketingPage() {
  const account = await getCurrentAccount();
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
