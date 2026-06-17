"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, MessageCircle, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { businessName, whatsappHref } from "@/lib/business-info";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/contact", label: "Contact" },
  { href: "/cart", label: "Cart" }
];

export function SiteHeader() {
  const router = useRouter();
  const { cartCount, lastAddedAt } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    ["/", "/shop", "/contact", "/cart"].forEach((href) => router.prefetch(href));
  }, [router]);

  useEffect(() => {
    if (!lastAddedAt) return;
    setPulse(true);
    const timer = window.setTimeout(() => setPulse(false), 650);
    return () => window.clearTimeout(timer);
  }, [lastAddedAt]);

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur-xl">
      <div className="container-pad flex h-20 items-center justify-between">
        <Link href="/" prefetch className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
          <Image src="/logo.jpeg" alt={`${businessName} logo`} width={46} height={46} className="h-12 w-12 rounded-full object-cover" priority sizes="48px" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold">Vicomeks International</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} prefetch className="text-black/70 transition hover:text-black">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href={whatsappHref} className="gold-ring hidden h-11 items-center justify-center gap-2 rounded-full border border-black/10 px-4 text-sm font-semibold hover:border-gold hover:bg-champagne sm:inline-flex">
            <MessageCircle size={17} /> WhatsApp
          </a>
          <Link href="/cart" prefetch onClick={() => setMenuOpen(false)} className={cn("gold-ring relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white transition hover:bg-gold hover:text-ink", pulse && "animate-cart-pop")} aria-label={`Cart with ${cartCount} item${cartCount === 1 ? "" : "s"}`}>
            <ShoppingBag size={19} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[11px] font-bold text-ink">
                {cartCount}
              </span>
            )}
          </Link>
          <button className="gold-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 md:hidden" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)}>
            <Menu size={18} />
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav className="container-pad grid gap-1 border-t border-black/10 pb-4 pt-2 text-sm font-medium md:hidden">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} prefetch onClick={() => setMenuOpen(false)} className="gold-ring rounded-md px-3 py-3 text-black/75 transition hover:bg-champagne hover:text-black">
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
