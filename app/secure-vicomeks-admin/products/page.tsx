import { ProductUploadForm } from "./product-upload-form";
import { getProducts } from "@/lib/products";
import { ProductManagementList } from "./product-management-list";

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <ProductUploadForm />
      <ProductManagementList products={products} />
    </div>
  );
}
