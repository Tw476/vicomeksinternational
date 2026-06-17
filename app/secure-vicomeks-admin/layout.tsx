import { AdminNav } from "@/components/admin/admin-nav";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authenticated = await isAdminAuthenticated();

  return (
    <main className="container-pad py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Secure admin</p>
        <h1 className="mt-2 text-4xl font-semibold">Vicomeks International Dashboard</h1>
      </div>
      {authenticated && <AdminNav />}
      {children}
    </main>
  );
}
