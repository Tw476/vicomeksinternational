"use client";

import Link from "next/link";
import { BarChart3, FolderKanban, LogOut, PackagePlus, ShieldCheck, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

const links = [
  { href: "/secure-vicomeks-admin", label: "Dashboard", icon: BarChart3 },
  { href: "/secure-vicomeks-admin/products", label: "Products", icon: PackagePlus },
  { href: "/secure-vicomeks-admin/product-organizer", label: "Product Organizer", icon: FolderKanban },
  { href: "/secure-vicomeks-admin/product-integrity", label: "Product Integrity Checker", icon: ShieldCheck },
  { href: "/secure-vicomeks-admin/bulk-upload", label: "Bulk Upload", icon: Upload }
];

export function AdminNav() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.replace("/secure-vicomeks-admin/login");
  }

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} prefetch className="gold-ring inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-4 py-3 text-sm font-semibold hover:border-gold hover:bg-champagne">
            <Icon size={16} /> {label}
          </Link>
        ))}
      </div>
      <button onClick={logout} className="gold-ring inline-flex items-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white hover:bg-gold hover:text-ink">
        <LogOut size={16} /> Logout
      </button>
    </div>
  );
}
