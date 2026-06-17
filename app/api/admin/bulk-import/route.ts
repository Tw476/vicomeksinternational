import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { isAdminAuthenticated, requireAdminResponse } from "@/lib/admin-auth";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { productsCollection, requireFirebaseAdmin } from "@/lib/firebase-admin";
import { inferCategory, slugify } from "@/lib/utils";

type ImportProduct = {
  name: string;
  imageCount: number;
};

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return requireAdminResponse();

  const formData = await request.formData();
  const products = JSON.parse(String(formData.get("products") || "[]")) as ImportProduct[];
  if (!products.length) return NextResponse.json({ error: "No products supplied." }, { status: 400 });

  const firebase = requireFirebaseAdmin();
  const report: string[] = [];

  for (const [productIndex, product] of products.entries()) {
    const name = product.name.trim();
    const files = formData.getAll(`images-${productIndex}`).filter((item): item is File => item instanceof File);
    if (!name) {
      report.push(`Skipped row ${productIndex + 1}: missing product name.`);
      continue;
    }
    if (!files.length) {
      report.push(`Skipped ${name}: no matching images.`);
      continue;
    }

    const slug = slugify(name);
    const imageUrls: string[] = [];
    for (const image of files) {
      try {
        imageUrls.push(await uploadImageToCloudinary(image, `vicomeksint/products/${slug}`));
      } catch (error) {
        report.push(`Image upload failed for ${name}: ${error instanceof Error ? error.message : "unknown error"}`);
        continue;
      }
    }

    if (!imageUrls.length) {
      report.push(`Skipped ${name}: all image uploads failed.`);
      continue;
    }

    try {
      await firebase.db.collection(productsCollection).doc(slug).set({
        id: slug,
        name,
        slug,
        category: inferCategory(name),
        images: imageUrls,
        created_at: FieldValue.serverTimestamp()
      }, { merge: true });
      report.push(`Saved ${name} with ${imageUrls.length} image(s).`);
    } catch (error) {
      report.push(`Save failed for ${name}: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  return NextResponse.json({ ok: true, report });
}
