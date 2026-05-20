import { ProductsManager } from "@/components/dashboard/products-manager";
import { getCurrentAccount } from "@/lib/account-context";
import { getBusinessDataset } from "@/lib/mock-data";

export default async function ProductsPage() {
  const account = await getCurrentAccount();
  const { products, categories } = getBusinessDataset();

  return (
    <ProductsManager
      initialProducts={products}
      categories={categories}
      currentPlan={account.plan}
    />
  );
}
