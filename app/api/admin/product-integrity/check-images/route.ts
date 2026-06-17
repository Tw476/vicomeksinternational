import { NextResponse } from "next/server";
import { isAdminAuthenticated, requireAdminResponse } from "@/lib/admin-auth";

type ImageCheckResult = {
  url: string;
  ok: boolean;
  status?: number;
  error?: string;
};

function isCheckableUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function checkImageUrl(url: string): Promise<ImageCheckResult> {
  if (!url.trim()) return { url, ok: false, error: "Missing image reference" };
  if (!isCheckableUrl(url)) return { url, ok: false, error: "Invalid URL" };

  try {
    let response = await fetch(url, { method: "HEAD", cache: "no-store", signal: AbortSignal.timeout(7000) });

    if (response.status === 405 || response.status === 403) {
      response = await fetch(url, { method: "GET", cache: "no-store", signal: AbortSignal.timeout(7000) });
    }

    return {
      url,
      ok: response.ok,
      status: response.status,
      error: response.ok ? undefined : `Image returned ${response.status}`
    };
  } catch {
    return { url, ok: false, error: "Image request failed" };
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return requireAdminResponse();

  const payload = await request.json().catch(() => ({}));
  const urls: string[] = Array.isArray(payload.urls) ? payload.urls.map(String) : [];
  const uniqueUrls: string[] = Array.from(new Set(urls)).slice(0, 1200);

  const results: ImageCheckResult[] = [];
  const batchSize = 12;

  for (let index = 0; index < uniqueUrls.length; index += batchSize) {
    const batch = uniqueUrls.slice(index, index + batchSize);
    results.push(...(await Promise.all(batch.map(checkImageUrl))));
  }

  return NextResponse.json({ results });
}
