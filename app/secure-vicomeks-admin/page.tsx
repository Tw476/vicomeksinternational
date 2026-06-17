import Link from "next/link";
import { FolderKanban, Package, Plus, ShieldCheck, Upload } from "lucide-react";
import { getProducts } from "@/lib/products";
import { ProductManagementList } from "./products/product-management-list";

export default async function AdminDashboardPage() {
  const products = await getProducts();
  const recent = products.slice(0, 5);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
          <Package className="text-gold" size={24} />
          <p className="mt-5 text-sm text-black/55">Total products</p>
          <p className="mt-2 text-4xl font-semibold">{products.length}</p>
        </div>
        <Link href="/secure-vicomeks-admin/products" prefetch className="rounded-lg border border-black/10 bg-white p-6 shadow-sm transition hover:border-gold">
          <Plus className="text-gold" size={24} />
          <p className="mt-5 font-semibold">Single product upload</p>
          <p className="mt-2 text-sm text-black/55">Add product name and multiple images.</p>
        </Link>
        <Link href="/secure-vicomeks-admin/product-organizer" prefetch className="rounded-lg border border-black/10 bg-white p-6 shadow-sm transition hover:border-gold">
          <FolderKanban className="text-gold" size={24} />
          <p className="mt-5 font-semibold">Product organizer</p>
          <p className="mt-2 text-sm text-black/55">Sort supplier images before importing.</p>
        </Link>
        <Link href="/secure-vicomeks-admin/product-integrity" prefetch className="rounded-lg border border-black/10 bg-white p-6 shadow-sm transition hover:border-gold">
          <ShieldCheck className="text-gold" size={24} />
          <p className="mt-5 font-semibold">Product integrity</p>
          <p className="mt-2 text-sm text-black/55">Find duplicates and image issues.</p>
        </Link>
        <Link href="/secure-vicomeks-admin/bulk-upload" prefetch className="rounded-lg border border-black/10 bg-white p-6 shadow-sm transition hover:border-gold">
          <Upload className="text-gold" size={24} />
          <p className="mt-5 font-semibold">Bulk CSV import</p>
          <p className="mt-2 text-sm text-black/55">Import 10+ products with ZIP image matching.</p>
        </Link>
      </div>
      <ProductManagementList products={recent} title="Recent uploads" emptyMessage="No recent products available." />
    </div>
  );
}
