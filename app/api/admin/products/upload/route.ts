import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { isAdminAuthenticated, requireAdminResponse } from "@/lib/admin-auth";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { productsCollection, requireFirebaseAdmin } from "@/lib/firebase-admin";
import { categories } from "@/lib/product-catalog";
import { inferCategory, slugify } from "@/lib/utils";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return requireAdminResponse();

  const formData = await request.formData();
  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const images = formData.getAll("images").filter((item): item is File => item instanceof File);
  if (!name || !images.length) return NextResponse.json({ error: "Product name and images are required." }, { status: 400 });

  const firebase = requireFirebaseAdmin();
  const slug = slugify(name);
  const imageUrls: string[] = [];

  for (const image of images) {
    imageUrls.push(await uploadImageToCloudinary(image, `vicomeksint/products/${slug}`));
  }

  await firebase.db.collection(productsCollection).doc(slug).set({
    id: slug,
    name,
    slug,
    category: categories.includes(category) ? category : inferCategory(name),
    images: imageUrls,
    created_at: FieldValue.serverTimestamp()
  }, { merge: true });

  return NextResponse.json({ ok: true });
}
