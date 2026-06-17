"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CartItem, Product } from "@/lib/types";

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product) => Promise<void>;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  lastAddedAt: number;
  toast: string;
  dismissToast: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "vicomeksint-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [lastAddedAt, setLastAddedAt] = useState(0);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) setItems(JSON.parse(stored) as CartItem[]);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    async addItem(product) {
      await new Promise((resolve) => window.setTimeout(resolve, 250));
      setItems((current) => {
        const existing = current.find((item) => item.product.id === product.id);
        if (existing) {
          return current.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        }
        return [...current, { product, quantity: 1 }];
      });
      setLastAddedAt(Date.now());
      setToast("Product added to cart successfully.");
    },
    removeItem(id) {
      setItems((current) => current.filter((item) => item.product.id !== id));
    },
    updateQuantity(id, quantity) {
      setItems((current) => current.map((item) => (item.product.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)));
    },
    clearCart() {
      setItems([]);
    },
    cartCount: items.reduce((sum, item) => sum + item.quantity, 0),
    lastAddedAt,
    toast,
    dismissToast() {
      setToast("");
    }
  }), [items, lastAddedAt, toast]);

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed right-4 top-24 z-[70] max-w-sm rounded-md border border-gold/40 bg-ink px-4 py-3 text-sm font-semibold text-white shadow-premium">
          <div className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-gold" />
            <p>{toast}</p>
            <button onClick={() => setToast("")} className="ml-2 text-white/55 hover:text-white" aria-label="Dismiss notification">x</button>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
