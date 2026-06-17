"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { categories } from "@/lib/product-catalog";

export function ProductUploadForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [status, setStatus] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Uploading...");
    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    Array.from(files || []).forEach((file) => formData.append("images", file));

    const response = await fetch("/api/admin/products/upload", { method: "POST", body: formData });
    const payload = await response.json();
    if (!response.ok) {
      setStatus(payload.error || "Upload failed.");
      return;
    }
    setName("");
    setFiles(null);
    setStatus("Product saved.");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="h-max rounded-lg border border-black/10 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Single product upload</h2>
      <div className="mt-5 grid gap-4">
        <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Product name" className="gold-ring h-12 rounded-md border border-black/10 px-4 text-sm" />
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="gold-ring h-12 rounded-md border border-black/10 bg-white px-4 text-sm">
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <input required type="file" multiple accept="image/*" onChange={(event) => setFiles(event.target.files)} className="gold-ring rounded-md border border-black/10 p-3 text-sm" />
        <button className="gold-ring rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-gold hover:text-ink">Save Product</button>
        {status && <p className="text-sm text-black/60">{status}</p>}
      </div>
    </form>
  );
}
