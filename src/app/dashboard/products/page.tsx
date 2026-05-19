import { ProductsManager } from "@/components/dashboard/products-manager";
import { getBusinessDataset } from "@/lib/mock-data";

export default function ProductsPage() {
  const { products, categories } = getBusinessDataset();

  return <ProductsManager initialProducts={products} categories={categories} />;
}
