import { BusinessProfileManager } from "@/components/dashboard/business-profile-manager";
import { getBusinessDataset } from "@/lib/mock-data";

export default function BusinessProfilePage() {
  const { business } = getBusinessDataset();

  return <BusinessProfileManager initialBusiness={business} />;
}
