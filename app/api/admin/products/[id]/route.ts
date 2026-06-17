import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated, requireAdminResponse } from "@/lib/admin-auth";
import { productsCollection, requireFirebaseAdmin } from "@/lib/firebase-admin";
import { categories } from "@/lib/product-catalog";

function revalidateProductPages() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/secure-vicomeks-admin");
  revalidatePath("/secure-vicomeks-admin/products");
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return requireAdminResponse();

  const { id } = await params;
  const productId = decodeURIComponent(id || "").trim();
  if (!productId) return NextResponse.json({ error: "Product id is required." }, { status: 400 });

  const payload = await request.json().catch(() => ({}));
  const name = String(payload.name || "").trim();
  const category = String(payload.category || "").trim();

  if (!name) return NextResponse.json({ error: "Product name is required." }, { status: 400 });
  if (!categories.includes(category)) return NextResponse.json({ error: "Choose a valid product category." }, { status: 400 });

  try {
    const firebase = requireFirebaseAdmin();
    await firebase.db.collection(productsCollection).doc(productId).set({ name, category }, { merge: true });
    revalidateProductPages();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Product update failed." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return requireAdminResponse();

  const { id } = await params;
  const productId = decodeURIComponent(id || "").trim();
  if (!productId) return NextResponse.json({ error: "Product id is required." }, { status: 400 });

  try {
    const firebase = requireFirebaseAdmin();
    await firebase.db.collection(productsCollection).doc(productId).delete();
    revalidateProductPages();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Product deletion failed." }, { status: 500 });
  }
}
