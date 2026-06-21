import { getProducts } from "@/lib/products";
import { ProductIntegrityChecker } from "./product-integrity-checker";

export const dynamic = "force-dynamic";

export default async function ProductIntegrityPage() {
  const products = await getProducts();

  return <ProductIntegrityChecker products={products} />;
}
