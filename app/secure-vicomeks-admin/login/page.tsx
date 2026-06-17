import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <div className="container-pad flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-lg border border-black/10 bg-white p-8 shadow-premium">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Admin access</p>
        <h1 className="mt-2 text-3xl font-semibold">Sign in</h1>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
