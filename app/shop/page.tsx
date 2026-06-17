import { ProductGrid } from "@/components/products/product-grid";
import { getProducts } from "@/lib/products";

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const products = await getProducts();
  const initialCategory = category || "All";

  return (
    <main className="container-pad py-12">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Shop</p>
        <h1 className="mt-2 text-4xl font-semibold">Importer and distributor product categories</h1>
        <p className="mt-3 max-w-2xl text-black/60">Browse wholesale and retail supply categories for homes, hotels, restaurants, salons, laundries, and commercial buyers.</p>
      </div>
      <ProductGrid products={products} initialCategory={initialCategory} />
    </main>
  );
}
