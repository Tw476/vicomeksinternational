"use client";

import { CheckSquare, Download, FileDown, FolderKanban, ImagePlus, Loader2, PackageCheck, Square, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { categories } from "@/lib/product-catalog";

type OrganizerProduct = {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  category: string;
  selected: boolean;
  imported: boolean;
  error?: string;
};

function cleanProductName(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function csvEscape(value: string) {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function downloadFile(fileName: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function ProductOrganizer() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<string[]>([]);
  const [products, setProducts] = useState<OrganizerProduct[]>([]);
  const [bulkCategory, setBulkCategory] = useState(categories[0]);
  const [bulkName, setBulkName] = useState("");
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const selectedCount = products.filter((product) => product.selected).length;
  const readyCount = products.filter((product) => product.name.trim()).length;
  const importedCount = products.filter((product) => product.imported).length;

  const groupedProducts = useMemo(() => {
    return categories.map((category) => ({
      category,
      products: products.filter((product) => product.category === category)
    })).filter((group) => group.products.length);
  }, [products]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function addFiles(fileList: FileList | File[]) {
    const imageFiles = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
    if (!imageFiles.length) {
      setStatus("Choose image files to organize.");
      return;
    }

    const newProducts = imageFiles.map((file, index) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.push(previewUrl);

      return {
        id: `${file.name}-${file.lastModified}-${file.size}-${Date.now()}-${index}`,
        file,
        previewUrl,
        name: cleanProductName(file.name),
        category: categories[0],
        selected: false,
        imported: false
      };
    });

    setProducts((current) => [
      ...current,
      ...newProducts
    ]);
    setProgress(20);
    setStatus(`${imageFiles.length} image(s) added. Review names and categories before export or import.`);
  }

  function updateProduct(id: string, changes: Partial<OrganizerProduct>) {
    setProducts((current) => current.map((product) => product.id === id ? { ...product, ...changes, error: changes.error } : product));
  }

  function toggleAll() {
    const shouldSelect = selectedCount !== products.length;
    setProducts((current) => current.map((product) => ({ ...product, selected: shouldSelect })));
  }

  function applyBulkCategory() {
    setProducts((current) => current.map((product) => product.selected ? { ...product, category: bulkCategory, imported: false } : product));
    setStatus(`Assigned ${bulkCategory} to ${selectedCount} selected image(s).`);
  }

  function applyBulkName() {
    const selected = products.filter((product) => product.selected);
    if (!bulkName.trim() || !selected.length) return;
    let count = 0;
    setProducts((current) => current.map((product) => {
      if (!product.selected) return product;
      count += 1;
      return { ...product, name: selected.length === 1 ? bulkName.trim() : `${bulkName.trim()} ${count}`, imported: false };
    }));
    setStatus(`Renamed ${selected.length} selected product(s).`);
  }

  function exportCsv() {
    const rows = ["name,category", ...products.map((product) => `${csvEscape(product.name.trim())},${csvEscape(product.category)}`)];
    downloadFile("products.csv", rows.join("\n"), "text/csv;charset=utf-8");
    setProgress(80);
    setStatus("products.csv generated.");
  }

  function exportCategorizedList() {
    const content = groupedProducts
      .map((group) => [group.category, ...group.products.map((product) => `- ${product.name.trim() || cleanProductName(product.file.name)}`)].join("\n"))
      .join("\n\n");
    downloadFile("categorized-product-list.txt", content || "No products organized yet.", "text/plain;charset=utf-8");
    setProgress(80);
    setStatus("Categorized product list generated.");
  }

  async function importProducts() {
    const items = products.filter((product) => product.name.trim() && !product.imported);
    if (!items.length) {
      setStatus("No new organized products are ready to import.");
      return;
    }

    setIsImporting(true);
    setStatus("Importing organized products...");
    setProgress(0);

    for (const [index, product] of items.entries()) {
      const formData = new FormData();
      formData.append("name", product.name.trim());
      formData.append("category", product.category);
      formData.append("images", product.file);

      try {
        const response = await fetch("/api/admin/products/upload", { method: "POST", body: formData });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Import failed.");
        updateProduct(product.id, { imported: true, error: undefined });
      } catch (error) {
        updateProduct(product.id, { error: error instanceof Error ? error.message : "Import failed." });
      }

      setProgress(Math.round(((index + 1) / items.length) * 100));
    }

    setIsImporting(false);
    setStatus("Import finished. Check any image cards marked with an error.");
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-gold">
              <FolderKanban size={20} />
              <p className="text-sm font-semibold uppercase tracking-[0.18em]">Product organizer</p>
            </div>
            <h2 className="mt-3 text-2xl font-semibold">Organize supplier images before importing</h2>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-md bg-black/[0.03] px-4 py-3"><span className="block text-lg font-semibold">{products.length}</span>Images</div>
            <div className="rounded-md bg-black/[0.03] px-4 py-3"><span className="block text-lg font-semibold">{selectedCount}</span>Selected</div>
            <div className="rounded-md bg-black/[0.03] px-4 py-3"><span className="block text-lg font-semibold">{importedCount}</span>Imported</div>
          </div>
        </div>

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            addFiles(event.dataTransfer.files);
          }}
          className={`mt-6 rounded-lg border border-dashed p-6 transition ${isDragging ? "border-gold bg-champagne" : "border-black/20 bg-black/[0.02]"}`}
        >
          <input ref={inputRef} type="file" multiple accept="image/*" onChange={(event) => event.target.files && addFiles(event.target.files)} className="hidden" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <ImagePlus className="mt-1 text-gold" size={24} />
              <div>
                <p className="font-semibold">Drop product images here</p>
                <p className="mt-1 text-sm text-black/55">Upload many supplier images at once, then name and categorize them in the grid.</p>
              </div>
            </div>
            <button type="button" onClick={() => inputRef.current?.click()} className="gold-ring inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-gold hover:text-ink">
              <UploadCloud size={17} /> Choose images
            </button>
          </div>
        </div>

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-black/10">
          <div className="h-full bg-gold transition-all" style={{ width: `${progress}%` }} />
        </div>
        {status && <p className="mt-3 text-sm text-black/65">{status}</p>}
      </section>

      {!!products.length && (
        <section className="rounded-lg border border-black/10 bg-white p-4 shadow-sm md:p-6">
          <div className="grid gap-3 lg:grid-cols-[auto_1fr_1fr_auto_auto] lg:items-end">
            <button type="button" onClick={toggleAll} className="gold-ring inline-flex items-center justify-center gap-2 rounded-md border border-black/10 px-4 py-3 text-sm font-semibold hover:border-gold hover:bg-champagne">
              {selectedCount === products.length ? <CheckSquare size={17} /> : <Square size={17} />} Select all
            </button>
            <select value={bulkCategory} onChange={(event) => setBulkCategory(event.target.value)} className="gold-ring h-12 rounded-md border border-black/10 bg-white px-4 text-sm">
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
            <input value={bulkName} onChange={(event) => setBulkName(event.target.value)} placeholder="Bulk product name" className="gold-ring h-12 rounded-md border border-black/10 px-4 text-sm" />
            <button type="button" disabled={!selectedCount} onClick={applyBulkCategory} className="gold-ring rounded-md border border-black/10 px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 hover:border-gold hover:bg-champagne">Assign category</button>
            <button type="button" disabled={!selectedCount || !bulkName.trim()} onClick={applyBulkName} className="gold-ring rounded-md border border-black/10 px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 hover:border-gold hover:bg-champagne">Rename selected</button>
          </div>
        </section>
      )}

      {!!products.length && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <article key={product.id} className={`overflow-hidden rounded-lg border bg-white shadow-sm ${product.selected ? "border-gold" : "border-black/10"}`}>
              <button type="button" onClick={() => updateProduct(product.id, { selected: !product.selected })} className="relative block aspect-square w-full bg-black/[0.03]">
                <img src={product.previewUrl} alt={product.name || product.file.name} className="h-full w-full object-cover" />
                <span className="absolute left-3 top-3 rounded-md bg-white/95 p-2 text-ink shadow-sm">
                  {product.selected ? <CheckSquare size={17} /> : <Square size={17} />}
                </span>
                {product.imported && <span className="absolute right-3 top-3 rounded-md bg-ink px-2 py-1 text-xs font-semibold text-white">Imported</span>}
              </button>
              <div className="grid gap-3 p-4">
                <input value={product.name} onChange={(event) => updateProduct(product.id, { name: event.target.value, imported: false })} placeholder="Product name" className="gold-ring h-11 rounded-md border border-black/10 px-3 text-sm" />
                <select value={product.category} onChange={(event) => updateProduct(product.id, { category: event.target.value, imported: false })} className="gold-ring h-11 rounded-md border border-black/10 bg-white px-3 text-sm">
                  {categories.map((item) => <option key={item}>{item}</option>)}
                </select>
                <p className="truncate text-xs text-black/45" title={product.file.name}>{product.file.name}</p>
                {product.error && <p className="text-sm text-red-600">{product.error}</p>}
              </div>
            </article>
          ))}
        </section>
      )}

      {!!products.length && (
        <section className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Export and import</h2>
              <p className="mt-2 text-sm text-black/55">{readyCount} of {products.length} product(s) have names ready for export or import.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={exportCsv} className="gold-ring inline-flex items-center justify-center gap-2 rounded-md border border-black/10 px-4 py-3 text-sm font-semibold hover:border-gold hover:bg-champagne">
                <Download size={17} /> products.csv
              </button>
              <button type="button" onClick={exportCategorizedList} className="gold-ring inline-flex items-center justify-center gap-2 rounded-md border border-black/10 px-4 py-3 text-sm font-semibold hover:border-gold hover:bg-champagne">
                <FileDown size={17} /> Categorized list
              </button>
              <button type="button" disabled={isImporting || !readyCount} onClick={importProducts} className="gold-ring inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45 hover:bg-gold hover:text-ink">
                {isImporting ? <Loader2 className="animate-spin" size={17} /> : <PackageCheck size={17} />} Import products
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
