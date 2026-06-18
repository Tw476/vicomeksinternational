"use client";

import Image from "next/image";
import Link from "next/link";
import { Loader2, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Product } from "@/lib/types";
import { useCart } from "@/components/cart/cart-provider";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const imageSrc = product.images[0] || "/frontpage.jpg";
  const isRemoteImage = imageSrc.startsWith("http://") || imageSrc.startsWith("https://");

  async function handleAdd() {
    setIsAdding(true);
    await addItem(product);
    setIsAdding(false);
  }

  return (
    <article className="group min-w-0 overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-premium">
      <Link href={`/products/${product.slug}`} prefetch className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-champagne">
          <Image src={imageSrc} alt={product.name} fill unoptimized={isRemoteImage} className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 767px) 50vw, (max-width: 1023px) 25vw, 25vw" />
        </div>
      </Link>
      <div className="min-w-0 p-3 sm:p-4">
        <p className="break-words text-[11px] font-medium uppercase tracking-[0.16em] text-gold sm:text-xs">{product.category}</p>
        <Link href={`/products/${product.slug}`} prefetch className="mt-2 block min-h-12 break-words text-sm font-semibold leading-snug text-ink hover:text-gold sm:text-base">
          {product.name}
        </Link>
        <button onClick={handleAdd} disabled={isAdding} className="gold-ring mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-3 py-3 text-xs font-semibold text-white transition hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:bg-black/55 sm:px-4 sm:text-sm">
          {isAdding ? <Loader2 className="animate-spin" size={16} /> : <ShoppingCart size={16} />}
          {isAdding ? "Adding..." : "Add to cart"}
        </button>
      </div>
    </article>
  );
}
