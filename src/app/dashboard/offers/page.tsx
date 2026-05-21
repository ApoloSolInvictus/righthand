import { OffersManager } from "@/components/dashboard/offers-manager";
import { getCurrentAccount } from "@/lib/account-context";
import { businessOffers, getPrimaryBusiness } from "@/lib/mock-data";

export default async function OffersPage() {
  const account = await getCurrentAccount();
  const fallbackBusiness = getPrimaryBusiness();
  const businessId = account.businessId || fallbackBusiness.id;
  const businessName = account.businessName || fallbackBusiness.name;

  return (
    <OffersManager
      businessId={businessId}
      businessName={businessName}
      initialOffers={businessOffers}
    />
  );
}
