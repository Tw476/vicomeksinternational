"use client";

import { Loader2, Pencil, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { categories } from "@/lib/product-catalog";
import { Product } from "@/lib/types";

type ProductManagementListProps = {
  products: Product[];
  title?: string;
  emptyMessage?: string;
};

export function ProductManagementList({
  products,
  title = "Product management",
  emptyMessage = "No products available."
}: ProductManagementListProps) {
  const router = useRouter();
  const [items, setItems] = useState(products);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState(categories[0]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    setItems(products);
  }, [products]);

  useEffect(() => {
    console.log(`ProductManagementList "${title}": received ${products.length} product(s); rendering ${items.length} item(s).`);
  }, [items.length, products.length, title]);

  function startEditing(product: Product) {
    setEditingProduct(product);
    setEditName(product.name);
    setEditCategory(product.category);
    setNotification("");
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingProduct) return;

    setIsSaving(true);
    setNotification("");

    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(editingProduct.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, category: editCategory })
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setNotification(payload.error || "Product update failed.");
        return;
      }

      setItems((current) => current.map((product) => (
        product.id === editingProduct.id ? { ...product, name: editName.trim(), category: editCategory } : product
      )));
      setEditingProduct(null);
      setNotification("Product updated successfully.");
      router.refresh();
    } catch {
      setNotification("Product update failed.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteProduct() {
    if (!selectedProduct) return;

    setIsDeleting(true);
    setNotification("");

    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(selectedProduct.id)}`, { method: "DELETE" });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setNotification(payload.error || "Product deletion failed.");
        return;
      }

      setItems((current) => current.filter((product) => product.id !== selectedProduct.id));
      setSelectedProduct(null);
      setNotification("Product deleted successfully.");
      router.refresh();
    } catch {
      setNotification("Product deletion failed.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      {notification && <p className="mt-4 rounded-md border border-black/10 bg-black/[0.03] px-4 py-3 text-sm text-black/70">{notification}</p>}
      <div className="mt-5 grid gap-3">
        {items.map((product) => (
          <div key={product.id} className="flex items-center justify-between gap-4 rounded-md bg-black/[0.03] px-4 py-3 text-sm">
            <span className="min-w-0 flex-1 font-medium">{product.name}</span>
            <span className="hidden text-black/45 sm:inline">{product.images.length} image(s)</span>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => startEditing(product)}
                className="gold-ring inline-flex items-center gap-2 rounded-md border border-black/10 px-3 py-2 text-xs font-semibold text-ink hover:border-gold hover:bg-champagne"
              >
                <Pencil size={14} /> Edit Product
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedProduct(product);
                  setNotification("");
                }}
                className="gold-ring inline-flex items-center gap-2 rounded-md border border-black/10 px-3 py-2 text-xs font-semibold text-ink hover:border-gold hover:bg-champagne"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
        {!items.length && <p className="rounded-md bg-black/[0.03] px-4 py-6 text-center text-sm text-black/55">{emptyMessage}</p>}
      </div>

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
          <form onSubmit={saveProduct} className="w-full max-w-md rounded-lg bg-white p-6 shadow-premium">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-ink">Edit product</h3>
                <p className="mt-3 text-sm leading-6 text-black/60">Update the product name and category.</p>
              </div>
              <button type="button" onClick={() => setEditingProduct(null)} disabled={isSaving} className="gold-ring rounded-md p-2 text-black/50 hover:bg-black/[0.05] hover:text-ink disabled:cursor-not-allowed">
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 grid gap-4">
              <input required value={editName} onChange={(event) => setEditName(event.target.value)} placeholder="Product name" className="gold-ring h-12 rounded-md border border-black/10 px-4 text-sm" />
              <select value={editCategory} onChange={(event) => setEditCategory(event.target.value)} className="gold-ring h-12 rounded-md border border-black/10 bg-white px-4 text-sm">
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setEditingProduct(null)} disabled={isSaving} className="gold-ring rounded-md border border-black/10 px-5 py-3 text-sm font-semibold hover:border-gold hover:bg-champagne disabled:cursor-not-allowed">
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="gold-ring inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:bg-black/55">
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Pencil size={16} />}
                {isSaving ? "Saving..." : "Save product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-premium">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-ink">Delete product</h3>
                <p className="mt-3 text-sm leading-6 text-black/60">Are you sure you want to delete this product? This action cannot be undone.</p>
              </div>
              <button type="button" onClick={() => setSelectedProduct(null)} disabled={isDeleting} className="gold-ring rounded-md p-2 text-black/50 hover:bg-black/[0.05] hover:text-ink disabled:cursor-not-allowed">
                <X size={18} />
              </button>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setSelectedProduct(null)} disabled={isDeleting} className="gold-ring rounded-md border border-black/10 px-5 py-3 text-sm font-semibold hover:border-gold hover:bg-champagne disabled:cursor-not-allowed">
                Cancel
              </button>
              <button type="button" onClick={deleteProduct} disabled={isDeleting} className="gold-ring inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:bg-black/55">
                {isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                {isDeleting ? "Deleting..." : "Delete product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
