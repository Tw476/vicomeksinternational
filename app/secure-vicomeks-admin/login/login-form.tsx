"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      if (!response.ok) {
        setError("Invalid password.");
        return;
      }
      const next = searchParams.get("next");
      router.replace(next?.startsWith("/secure-vicomeks-admin") ? next : "/secure-vicomeks-admin");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-4">
      <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Admin password" className="gold-ring h-12 rounded-md border border-black/10 px-4 text-sm" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={isSubmitting} className="gold-ring rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:bg-black/55">
        {isSubmitting ? "Checking..." : "Enter dashboard"}
      </button>
    </form>
  );
}
