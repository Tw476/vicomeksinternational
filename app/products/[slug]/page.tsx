import Image from "next/image";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { whatsappProductHref } from "@/lib/business-info";
import { getProduct, getProducts } from "@/lib/products";
import { AddToCartButton } from "./product-actions";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "https";
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || (host ? `${protocol}://${host}` : "")).replace(/\/$/, "");
  const productUrl = `${siteUrl}/products/${product.slug}`;
  const products = await getProducts();
  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);

  return (
    <main className="container-pad py-12">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
        <div className="grid gap-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-champagne">
            <Image src={product.images[0] || "/frontpage.jpg"} alt={product.name} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 52vw" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {product.images.slice(0, 4).map((image) => (
              <div key={image} className="relative aspect-square overflow-hidden rounded-md bg-champagne">
                <Image src={image} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 25vw, 13vw" />
              </div>
            ))}
          </div>
        </div>
        <section className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">{product.category}</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight">{product.name}</h1>
          <p className="mt-5 text-black/60">Request current availability, specifications, wholesale or retail supply details, pickup, delivery, and pricing from the sales team.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <AddToCartButton product={product} />
            <a href={whatsappProductHref(product.name, productUrl)} className="gold-ring inline-flex items-center justify-center gap-2 rounded-md border border-black/15 px-5 py-3 text-sm font-semibold hover:border-gold hover:bg-champagne">
              <MessageCircle size={17} /> WhatsApp inquiry
            </a>
          </div>
        </section>
      </div>
      <section className="mt-16">
        <h2 className="text-2xl font-semibold">Related products</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {(related.length ? related : products.slice(0, 4)).map((item) => <ProductCard key={item.id} product={item} />)}
        </div>
      </section>
    </main>
  );
}
