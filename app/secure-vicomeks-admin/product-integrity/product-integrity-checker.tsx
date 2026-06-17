"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Eye, Loader2, Pencil, RefreshCw, ShieldCheck, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { categories } from "@/lib/product-catalog";
import { Product } from "@/lib/types";
import { slugify } from "@/lib/utils";

type IssueType = "Duplicate Product" | "Duplicate Image" | "Broken Image URL" | "Missing Image" | "Empty Product" | "Invalid Product Data";

type IntegrityIssue = {
  id: string;
  product: Product;
  issueType: IssueType;
  suggestedAction: string;
  detail: string;
  relatedProductIds: string[];
};

type ImageCheckResult = {
  url: string;
  ok: boolean;
  status?: number;
  error?: string;
};

const issueLabels: IssueType[] = [
  "Duplicate Product",
  "Duplicate Image",
  "Broken Image URL",
  "Missing Image",
  "Empty Product",
  "Invalid Product Data"
];

function cleanName(value: string) {
  return slugify(value.replace(/\([^)]*\)/g, " ")).replace(/-/g, "");
}

function editProductHref(product: Product) {
  return `/secure-vicomeks-admin/products?product=${encodeURIComponent(product.id)}`;
}

function productIssueKey(productId: string, issueType: IssueType, detail: string) {
  return `${productId}:${issueType}:${detail}`;
}

function ensureUniqueIssueIds(issues: IntegrityIssue[]) {
  const idCounts = new Map<string, number>();

  return issues.map((issue) => {
    const count = (idCounts.get(issue.id) || 0) + 1;
    idCounts.set(issue.id, count);

    if (count === 1) return issue;

    return {
      ...issue,
      id: `${issue.id}-${count}`
    };
  });
}

function findLocalIssues(products: Product[]) {
  const issues: IntegrityIssue[] = [];
  const nameGroups = new Map<string, Product[]>();
  const slugGroups = new Map<string, Product[]>();
  const imageGroups = new Map<string, Product[]>();

  products.forEach((product) => {
    const trimmedName = product.name.trim();
    const normalizedName = cleanName(trimmedName);
    const slug = product.slug.trim().toLowerCase();

    if (!trimmedName || !product.images.length) {
      issues.push({
        id: productIssueKey(product.id, "Empty Product", !trimmedName ? "Missing product name" : "No images"),
        product,
        issueType: "Empty Product",
        suggestedAction: !trimmedName ? "Edit product name or delete the empty record." : "Add product images or delete the incomplete product.",
        detail: !trimmedName ? "Missing product name" : "No images",
        relatedProductIds: []
      });
    }

    if (!categories.includes(product.category)) {
      issues.push({
        id: productIssueKey(product.id, "Invalid Product Data", `Invalid category: ${product.category || "None"}`),
        product,
        issueType: "Invalid Product Data",
        suggestedAction: "Edit product and choose a valid category.",
        detail: `Invalid category: ${product.category || "None"}`,
        relatedProductIds: []
      });
    }

    product.images.forEach((image) => {
      const url = image.trim();
      if (!url) {
        issues.push({
          id: productIssueKey(product.id, "Missing Image", "Blank image reference"),
          product,
          issueType: "Missing Image",
          suggestedAction: "Edit product images or remove the blank image reference.",
          detail: "Blank image reference",
          relatedProductIds: []
        });
        return;
      }

      const existing = imageGroups.get(url) || [];
      imageGroups.set(url, [...existing, product]);
    });

    if (normalizedName) nameGroups.set(normalizedName, [...(nameGroups.get(normalizedName) || []), product]);
    if (slug) slugGroups.set(slug, [...(slugGroups.get(slug) || []), product]);
  });

  const duplicatePairs = new Map<string, { products: Product[]; reason: string }>();

  function addDuplicateGroup(productsInGroup: Product[], reason: string) {
    if (productsInGroup.length < 2) return;
    const ids = productsInGroup.map((product) => product.id).sort();
    duplicatePairs.set(ids.join("|"), { products: productsInGroup, reason });
  }

  nameGroups.forEach((group) => addDuplicateGroup(group, "Identical or near-identical product names"));
  slugGroups.forEach((group) => addDuplicateGroup(group, "Same product slug"));

  for (let first = 0; first < products.length; first += 1) {
    for (let second = first + 1; second < products.length; second += 1) {
      const firstName = cleanName(products[first].name);
      const secondName = cleanName(products[second].name);
      if (firstName && secondName && firstName !== secondName && (firstName.includes(secondName) || secondName.includes(firstName))) {
        addDuplicateGroup([products[first], products[second]], "Very similar product names");
      }
    }
  }

  imageGroups.forEach((group, url) => {
    const uniqueProducts = Array.from(new Map(group.map((product) => [product.id, product])).values());
    if (uniqueProducts.length > 1) {
      addDuplicateGroup(uniqueProducts, "Same image URL");
      uniqueProducts.forEach((product) => {
        issues.push({
          id: productIssueKey(product.id, "Duplicate Image", url),
          product,
          issueType: "Duplicate Image",
          suggestedAction: "Review products using this same image and keep only the correct image assignment.",
          detail: url,
          relatedProductIds: uniqueProducts.filter((item) => item.id !== product.id).map((item) => item.id)
        });
      });
    }
  });

  duplicatePairs.forEach(({ products: duplicateProducts, reason }) => {
    duplicateProducts.forEach((product) => {
      issues.push({
        id: productIssueKey(product.id, "Duplicate Product", reason),
        product,
        issueType: "Duplicate Product",
        suggestedAction: "Compare related products, then edit, merge manually, ignore, or delete the duplicate after review.",
        detail: reason,
        relatedProductIds: duplicateProducts.filter((item) => item.id !== product.id).map((item) => item.id)
      });
    });
  });

  return ensureUniqueIssueIds(issues);
}

export function ProductIntegrityChecker({ products }: { products: Product[] }) {
  const router = useRouter();
  const [issues, setIssues] = useState<IntegrityIssue[]>([]);
  const [selectedIssueIds, setSelectedIssueIds] = useState<string[]>([]);
  const [ignoredIssueIds, setIgnoredIssueIds] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Ready to scan products.");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const visibleIssues = useMemo(() => issues.filter((issue) => !ignoredIssueIds.includes(issue.id)), [ignoredIssueIds, issues]);
  const selectedIssues = visibleIssues.filter((issue) => selectedIssueIds.includes(issue.id));
  const selectedProducts = Array.from(new Map(selectedIssues.map((issue) => [issue.product.id, issue.product])).values());

  const summary = useMemo(() => {
    const counts = new Map<IssueType, number>();
    issueLabels.forEach((label) => counts.set(label, 0));
    visibleIssues.forEach((issue) => counts.set(issue.issueType, (counts.get(issue.issueType) || 0) + 1));
    return counts;
  }, [visibleIssues]);

  async function scanProducts() {
    setIsScanning(true);
    setProgress(10);
    setStatus("Checking product names, slugs, categories, and missing images...");
    setSelectedIssueIds([]);

    const nextIssues = findLocalIssues(products);
    setIssues(nextIssues);
    setProgress(45);

    const urls = products.flatMap((product) => product.images).filter((image) => image.trim());
    setStatus("Checking image URLs...");

    try {
      const response = await fetch("/api/admin/product-integrity/check-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls })
      });
      const payload = await response.json().catch(() => ({ results: [] }));
      const results: ImageCheckResult[] = Array.isArray(payload.results) ? payload.results : [];
      const brokenByUrl = new Map(results.filter((result) => !result.ok).map((result) => [result.url, result]));

      const brokenIssues = products.flatMap((product) => (
        product.images
          .map((image) => image.trim())
          .filter((image) => brokenByUrl.has(image))
          .map((image) => {
            const result = brokenByUrl.get(image);
            return {
              id: productIssueKey(product.id, "Broken Image URL", image),
              product,
              issueType: "Broken Image URL" as const,
              suggestedAction: "Replace the image URL, re-upload the image, or remove the invalid reference.",
              detail: result?.error || (result?.status ? `Image returned ${result.status}` : image),
              relatedProductIds: []
            };
          })
      ));

      setIssues(ensureUniqueIssueIds([...nextIssues, ...brokenIssues]));
      setProgress(100);
      setStatus("Scan complete.");
    } catch {
      setProgress(100);
      setStatus("Scan complete, but remote image URL checks could not finish.");
    } finally {
      setIsScanning(false);
    }
  }

  useEffect(() => {
    scanProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  function toggleIssue(issueId: string) {
    setSelectedIssueIds((current) => (
      current.includes(issueId) ? current.filter((id) => id !== issueId) : [...current, issueId]
    ));
  }

  function toggleAllVisible() {
    if (selectedIssueIds.length === visibleIssues.length) {
      setSelectedIssueIds([]);
      return;
    }
    setSelectedIssueIds(visibleIssues.map((issue) => issue.id));
  }

  function ignoreSelected() {
    setIgnoredIssueIds((current) => Array.from(new Set([...current, ...selectedIssueIds])));
    setSelectedIssueIds([]);
    setStatus("Selected issues ignored for this review session.");
  }

  function markSelectedFixed() {
    setIgnoredIssueIds((current) => Array.from(new Set([...current, ...selectedIssueIds])));
    setSelectedIssueIds([]);
    setStatus("Selected issues marked as fixed for this review session. Rescan to verify permanent data changes.");
  }

  async function deleteProducts(productsToDelete: Product[]) {
    setIsDeleting(true);
    setStatus("Deleting selected products...");

    try {
      for (const product of productsToDelete) {
        const response = await fetch(`/api/admin/products/${encodeURIComponent(product.id)}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Delete failed");
      }

      setDeleteTarget(null);
      setBulkDeleteOpen(false);
      setSelectedIssueIds([]);
      setStatus("Deletion complete. Refreshing product data...");
      router.refresh();
    } catch {
      setStatus("Product deletion failed. No automatic retry was attempted.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="grid gap-6">
      <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-gold" size={24} />
              <h2 className="text-2xl font-semibold">Product Integrity Checker</h2>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-black/60">
              Review duplicate products, duplicate images, broken image URLs, missing images, empty products, and invalid data before taking action.
            </p>
          </div>
          <button
            type="button"
            onClick={scanProducts}
            disabled={isScanning}
            className="gold-ring inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:bg-black/55"
          >
            {isScanning ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
            {isScanning ? "Scanning..." : "Rescan"}
          </button>
        </div>
        <div className="mt-5">
          <div className="h-2 overflow-hidden rounded-full bg-black/[0.06]">
            <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-3 text-sm text-black/60">{status}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard label="Total Products" value={products.length} />
        <SummaryCard label="Duplicates Found" value={summary.get("Duplicate Product") || 0} />
        <SummaryCard label="Broken Images" value={summary.get("Broken Image URL") || 0} />
        <SummaryCard label="Missing Images" value={(summary.get("Missing Image") || 0) + (summary.get("Empty Product") || 0)} />
        <SummaryCard label="Invalid Data" value={summary.get("Invalid Product Data") || 0} />
      </div>

      <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-xl font-semibold">Integrity report</h3>
            <p className="mt-2 text-sm text-black/55">{visibleIssues.length} flagged item(s). No products are deleted automatically.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={toggleAllVisible} disabled={!visibleIssues.length} className="gold-ring rounded-md border border-black/10 px-4 py-3 text-sm font-semibold hover:border-gold hover:bg-champagne disabled:cursor-not-allowed disabled:opacity-50">
              {selectedIssueIds.length === visibleIssues.length && visibleIssues.length ? "Clear Selection" : "Select All"}
            </button>
            <button type="button" onClick={markSelectedFixed} disabled={!selectedIssueIds.length} className="gold-ring rounded-md border border-black/10 px-4 py-3 text-sm font-semibold hover:border-gold hover:bg-champagne disabled:cursor-not-allowed disabled:opacity-50">
              Bulk Fix
            </button>
            <button type="button" onClick={ignoreSelected} disabled={!selectedIssueIds.length} className="gold-ring rounded-md border border-black/10 px-4 py-3 text-sm font-semibold hover:border-gold hover:bg-champagne disabled:cursor-not-allowed disabled:opacity-50">
              Bulk Ignore
            </button>
            <button type="button" onClick={() => setBulkDeleteOpen(true)} disabled={!selectedProducts.length} className="gold-ring inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:bg-black/55">
              <Trash2 size={16} /> Bulk Delete
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {visibleIssues.map((issue, index) => (
            <article key={`${issue.id}-${index}`} className="grid gap-4 rounded-md border border-black/10 bg-black/[0.02] p-4 lg:grid-cols-[auto_1.2fr_1fr_1.5fr_auto] lg:items-center">
              <input
                type="checkbox"
                checked={selectedIssueIds.includes(issue.id)}
                onChange={() => toggleIssue(issue.id)}
                className="h-5 w-5 rounded border-black/20"
                aria-label={`Select ${issue.product.name || "unnamed product"}`}
              />
              <div className="min-w-0">
                <p className="font-semibold">{issue.product.name || "Unnamed product"}</p>
                <p className="mt-1 truncate text-xs text-black/45">ID: {issue.product.id}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">{issue.issueType}</p>
                <p className="mt-1 text-xs text-black/55">{issue.detail}</p>
              </div>
              <p className="text-sm leading-6 text-black/60">{issue.suggestedAction}</p>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Link href={`/products/${issue.product.slug}`} className="gold-ring inline-flex items-center gap-2 rounded-md border border-black/10 px-3 py-2 text-xs font-semibold hover:border-gold hover:bg-champagne">
                  <Eye size={14} /> View Product
                </Link>
                <Link href={editProductHref(issue.product)} className="gold-ring inline-flex items-center gap-2 rounded-md border border-black/10 px-3 py-2 text-xs font-semibold hover:border-gold hover:bg-champagne">
                  <Pencil size={14} /> Edit Product
                </Link>
                <button type="button" onClick={() => setDeleteTarget(issue.product)} className="gold-ring inline-flex items-center gap-2 rounded-md border border-black/10 px-3 py-2 text-xs font-semibold hover:border-gold hover:bg-champagne">
                  <Trash2 size={14} /> Delete Product
                </button>
              </div>
            </article>
          ))}

          {!visibleIssues.length && (
            <div className="rounded-md bg-black/[0.03] px-4 py-10 text-center">
              <CheckCircle2 className="mx-auto text-gold" size={28} />
              <p className="mt-3 font-semibold">No active issues found.</p>
              <p className="mt-2 text-sm text-black/55">Run another scan after product edits to verify the catalog.</p>
            </div>
          )}
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDeleteDialog
          title="Delete product"
          description={`This will permanently delete "${deleteTarget.name || "Unnamed product"}". This action cannot be undone.`}
          isDeleting={isDeleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => deleteProducts([deleteTarget])}
        />
      )}

      {bulkDeleteOpen && (
        <ConfirmDeleteDialog
          title="Bulk delete products"
          description={`This will permanently delete ${selectedProducts.length} selected product(s). This action cannot be undone.`}
          isDeleting={isDeleting}
          onCancel={() => setBulkDeleteOpen(false)}
          onConfirm={() => deleteProducts(selectedProducts)}
        />
      )}
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
      <p className="text-sm text-black/55">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function ConfirmDeleteDialog({
  title,
  description,
  isDeleting,
  onCancel,
  onConfirm
}: {
  title: string;
  description: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-premium">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-gold" size={22} />
              <h3 className="text-lg font-semibold text-ink">{title}</h3>
            </div>
            <p className="mt-4 text-sm font-semibold text-ink">Warning: permanent deletion requires admin confirmation.</p>
            <p className="mt-3 text-sm leading-6 text-black/60">{description}</p>
          </div>
          <button type="button" onClick={onCancel} disabled={isDeleting} className="gold-ring rounded-md p-2 text-black/50 hover:bg-black/[0.05] hover:text-ink disabled:cursor-not-allowed">
            <X size={18} />
          </button>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} disabled={isDeleting} className="gold-ring rounded-md border border-black/10 px-5 py-3 text-sm font-semibold hover:border-gold hover:bg-champagne disabled:cursor-not-allowed">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={isDeleting} className="gold-ring inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:bg-black/55">
            {isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
            {isDeleting ? "Deleting..." : "Confirm Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
