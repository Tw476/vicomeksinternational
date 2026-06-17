"use client";

import { useMemo, useState } from "react";
import { whatsappHref } from "@/lib/business-info";
import { useCart } from "./cart-provider";

export function CheckoutForm() {
  const { items, clearCart } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const message = useMemo(() => {
    return `${whatsappHref}?text=${encodeURIComponent(`New order inquiry\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\nProducts:\n${items.map((item) => `- ${item.product.name} x ${item.quantity}`).join("\n")}`)}`;
  }, [address, items, name, phone]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <form className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
        <div className="grid gap-4">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" className="gold-ring h-12 rounded-md border border-black/10 px-4 text-sm" />
          <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone number" className="gold-ring h-12 rounded-md border border-black/10 px-4 text-sm" />
          <textarea value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Delivery address" rows={5} className="gold-ring rounded-md border border-black/10 p-4 text-sm" />
        </div>
        <a href={message} onClick={clearCart} className="gold-ring mt-6 inline-flex w-full justify-center rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-gold hover:text-ink">Send order on WhatsApp</a>
      </form>
      <aside className="h-max rounded-lg border border-black/10 bg-white p-6 shadow-sm">
        <p className="text-lg font-semibold">Order summary</p>
        <div className="mt-5 grid gap-3">
          {items.map((item) => (
            <div key={item.product.id} className="flex justify-between gap-4 border-b border-black/10 pb-3 text-sm">
              <span>{item.product.name}</span>
              <span className="font-semibold">x{item.quantity}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
