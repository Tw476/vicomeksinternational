import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-8 shadow-sm">
      <ShieldAlert className="text-gold" size={28} />
      <h2 className="mt-5 text-2xl font-semibold">Unauthorized access</h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-black/60">
        This admin area is restricted. Sign in with an authorized admin password to continue.
      </p>
      <Link href="/secure-vicomeks-admin/login" prefetch className="gold-ring mt-6 inline-flex rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-gold hover:text-ink">
        Go to login
      </Link>
    </div>
  );
}
