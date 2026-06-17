"use client";

import { Loader2, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { Product } from "@/lib/types";

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  async function handleAdd() {
    setIsAdding(true);
    await addItem(product);
    setIsAdding(false);
  }

  return (
    <button onClick={handleAdd} disabled={isAdding} className="gold-ring inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:bg-black/55">
      {isAdding ? <Loader2 className="animate-spin" size={17} /> : <ShoppingCart size={17} />}
      {isAdding ? "Adding..." : "Add to cart"}
    </button>
  );
}
