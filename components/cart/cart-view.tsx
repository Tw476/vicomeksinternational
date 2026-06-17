"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "./cart-provider";

export function CartView() {
  const { items, removeItem, updateQuantity } = useCart();

  if (!items.length) {
    return (
      <div className="rounded-lg border border-black/10 bg-white p-10 text-center shadow-sm">
        <p className="text-xl font-semibold">Your cart is empty</p>
        <Link href="/shop" prefetch className="gold-ring mt-6 inline-flex rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-gold hover:text-ink">Shop products</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.product.id} className="grid grid-cols-[88px_1fr] gap-4 rounded-lg border border-black/10 bg-white p-4 shadow-sm">
            <div className="relative aspect-square overflow-hidden rounded-md bg-champagne">
              <Image src={item.product.images[0] || "/frontpage.jpg"} alt={item.product.name} fill className="object-cover" sizes="88px" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold">{item.product.name}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-gold">{item.product.category}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex items-center rounded-md border border-black/10">
                  <button className="h-10 w-10" onClick={() => updateQuantity(item.product.id, item.quantity - 1)} aria-label="Decrease quantity"><Minus size={15} className="mx-auto" /></button>
                  <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                  <button className="h-10 w-10" onClick={() => updateQuantity(item.product.id, item.quantity + 1)} aria-label="Increase quantity"><Plus size={15} className="mx-auto" /></button>
                </div>
                <button onClick={() => removeItem(item.product.id)} className="gold-ring inline-flex h-10 w-10 items-center justify-center rounded-md bg-black/5 text-black/60 hover:bg-ink hover:text-white" aria-label="Remove item">
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <aside className="h-max rounded-lg border border-black/10 bg-white p-6 shadow-sm">
        <p className="text-lg font-semibold">Order summary</p>
        <p className="mt-3 text-sm text-black/60">{items.reduce((sum, item) => sum + item.quantity, 0)} selected item(s). Pricing is confirmed by sales after inquiry.</p>
        <Link href="/checkout" prefetch className="gold-ring mt-6 inline-flex w-full justify-center rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-gold hover:text-ink">Proceed to checkout</Link>
      </aside>
    </div>
  );
}
