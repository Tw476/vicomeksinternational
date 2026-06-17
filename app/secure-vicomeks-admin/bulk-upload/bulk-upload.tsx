"use client";

import JSZip from "jszip";
import { Download, FileArchive, FileText, UploadCloud } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeName } from "@/lib/utils";

type PreviewProduct = {
  name: string;
  images: File[];
  errors: string[];
};

function parseCsv(csv: string) {
  const lines = csv.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const header = lines.shift()?.toLowerCase();
  if (header !== "name") throw new Error("CSV must have a single header named: name");
  return lines.map((line) => line.replace(/^"|"$/g, "").trim()).filter(Boolean);
}

function imageBaseName(path: string) {
  const file = path.split("/").pop() || path;
  return file.replace(/\.[^.]+$/, "");
}

export function BulkUpload() {
  const router = useRouter();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewProduct[]>([]);
  const [status, setStatus] = useState("");
  const [report, setReport] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  async function buildPreview() {
    setStatus("Reading CSV and ZIP...");
    setReport([]);
    setProgress(15);
    if (!csvFile || !zipFile) {
      setStatus("Upload both CSV and ZIP files.");
      return;
    }

    try {
      const names = parseCsv(await csvFile.text());
      const zip = await JSZip.loadAsync(zipFile);
      const entries = Object.values(zip.files).filter((entry) => !entry.dir && /\.(png|jpe?g|webp|avif)$/i.test(entry.name));
      const products: PreviewProduct[] = [];

      for (const [productIndex, name] of names.entries()) {
        const normalizedProduct = normalizeName(name);
        const matched = entries.filter((entry) => {
          const normalizedFile = normalizeName(imageBaseName(entry.name));
          return normalizedFile.includes(normalizedProduct) || normalizedProduct.includes(normalizedFile);
        });

        const images = await Promise.all(
          matched.map(async (entry, imageIndex) => {
            const blob = await entry.async("blob");
            const extension = entry.name.split(".").pop() || "jpg";
            return new File([blob], `${normalizeName(name)}-${imageIndex}.${extension}`, { type: blob.type || `image/${extension}` });
          })
        );

        products.push({ name, images, errors: images.length ? [] : ["No matching images found"] });
        setProgress(15 + Math.round(((productIndex + 1) / names.length) * 55));
      }

      setPreview(products);
      setStatus(`Preview ready: ${products.length} product(s), ${products.reduce((sum, item) => sum + item.images.length, 0)} image(s).`);
      setProgress(75);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Preview failed.");
      setProgress(0);
    }
  }

  async function saveImport() {
    setStatus("Saving products...");
    setReport([]);
    setProgress(82);
    const formData = new FormData();
    formData.append("products", JSON.stringify(preview.map((item) => ({ name: item.name, imageCount: item.images.length }))));
    preview.forEach((product, productIndex) => {
      product.images.forEach((image) => formData.append(`images-${productIndex}`, image));
    });

    const response = await fetch("/api/admin/bulk-import", { method: "POST", body: formData });
    const payload = await response.json();
    if (!response.ok) {
      setStatus(payload.error || "Import failed.");
      setReport(payload.report || []);
      setProgress(0);
      return;
    }
    setStatus("Bulk import completed.");
    setReport(payload.report || []);
    setProgress(100);
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Bulk product import</h2>
            <p className="mt-2 text-sm text-black/55">Upload a CSV with a name column, then a ZIP containing matching product images.</p>
          </div>
          <a href="data:text/csv;charset=utf-8,name%0APanasonic%20Blender%0ASilver%20Crest%20Kettle%0ALG%20Washing%20Machine" download="product-import-template.csv" className="gold-ring inline-flex items-center justify-center gap-2 rounded-md border border-black/10 px-4 py-3 text-sm font-semibold hover:border-gold hover:bg-champagne">
            <Download size={16} /> CSV template
          </a>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="rounded-lg border border-dashed border-black/20 p-5">
            <span className="flex items-center gap-2 text-sm font-semibold"><FileText size={17} /> Step 1: Upload CSV file</span>
            <input type="file" accept=".csv,text/csv" onChange={(event) => setCsvFile(event.target.files?.[0] || null)} className="mt-4 block w-full text-sm" />
          </label>
          <label className="rounded-lg border border-dashed border-black/20 p-5">
            <span className="flex items-center gap-2 text-sm font-semibold"><FileArchive size={17} /> Step 2: Upload ZIP image folder</span>
            <input type="file" accept=".zip,application/zip" onChange={(event) => setZipFile(event.target.files?.[0] || null)} className="mt-4 block w-full text-sm" />
          </label>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button onClick={buildPreview} className="gold-ring inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-gold hover:text-ink">
            <UploadCloud size={17} /> Preview import
          </button>
          <button disabled={!preview.length} onClick={saveImport} className="gold-ring inline-flex items-center justify-center rounded-md border border-black/10 px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 hover:border-gold hover:bg-champagne">
            Save products
          </button>
        </div>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-black/10">
          <div className="h-full bg-gold transition-all" style={{ width: `${progress}%` }} />
        </div>
        {status && <p className="mt-3 text-sm text-black/65">{status}</p>}
      </section>

      {!!preview.length && (
        <section className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Preview before saving</h2>
          <div className="mt-5 grid gap-3">
            {preview.map((product) => (
              <div key={product.name} className="rounded-md bg-black/[0.03] p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-black/55">{product.images.length} image(s)</p>
                </div>
                {product.errors.map((error) => <p key={error} className="mt-2 text-sm text-red-600">{error}</p>)}
              </div>
            ))}
          </div>
        </section>
      )}

      {!!report.length && (
        <section className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Success and error report</h2>
          <div className="mt-4 grid gap-2 text-sm text-black/65">
            {report.map((item) => <p key={item}>{item}</p>)}
          </div>
        </section>
      )}
    </div>
  );
}
