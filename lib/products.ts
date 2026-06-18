import { Timestamp } from "firebase-admin/firestore";
import { unstable_noStore as noStore } from "next/cache";
import { getFirebaseAdmin, productsCollection } from "./firebase-admin";
import { categories } from "./product-catalog";
import { Product } from "./types";
import { inferCategory, slugify } from "./utils";

export { categories };

const names = [
  "Industrial Gas Oven",
  "Commercial Deep Freezer",
  "Panasonic Power Blender",
  "LG Front Load Washing Machine",
  "Professional Hair Clipper Set",
  "Silver Crest Electric Kettle",
  "Elepaq Soundproof Generator",
  "Stainless Steel Pot Set",
  "Samsung Double Door Refrigerator"
];

export const demoProducts: Product[] = names.map((name, index) => ({
  id: `demo-${index + 1}`,
  name,
  slug: slugify(name),
  category: inferCategory(name),
  images: ["/frontpage.jpg"],
  created_at: new Date(Date.now() - index * 86400000).toISOString()
}));

function toIsoDate(value: unknown) {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return undefined;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function normalizeImages(data: FirebaseFirestore.DocumentData) {
  const values: unknown[] = [];

  if (Array.isArray(data.images)) {
    values.push(...data.images);
  } else if (data.images && typeof data.images === "object") {
    values.push(...Object.values(data.images));
  }

  values.push(data.image, data.imageUrl);

  return values
    .filter((image): image is string => typeof image === "string" && image.trim().length > 0)
    .map((image) => image.trim());
}

function logProductDiagnostics(products: Product[], projectId?: string) {
  const missingImages = products.filter((product) => product.images.length === 0).length;
  const invalidCategories = products.filter((product) => !categories.includes(product.category)).length;
  const missingNames = products.filter((product) => !product.name.trim()).length;

  console.log(
    [
      `Products: Firestore query returned ${products.length} product(s).`,
      `Firebase project id: ${projectId || "unknown"}.`,
      `Missing images: ${missingImages}.`,
      `Invalid categories: ${invalidCategories}.`,
      `Missing names: ${missingNames}.`
    ].join(" ")
  );
}

export async function getProducts(): Promise<Product[]> {
  noStore();

  const firebase = getFirebaseAdmin();
  if (!firebase) {
    console.warn(`Products: Firebase Admin unavailable; falling back to ${demoProducts.length} demo product(s).`);
    return demoProducts;
  }

  try {
    const snapshot = await firebase.db.collection(productsCollection).orderBy("created_at", "desc").get();
    if (snapshot.empty) {
      console.warn(`Products: Firestore query returned 0 product(s) from project ${firebase.projectId || "unknown"}; falling back to ${demoProducts.length} demo product(s).`);
      return demoProducts;
    }

    const products = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        name: String(data.name || ""),
        slug: String(data.slug || doc.id),
        category: String(data.category || "Uncategorized"),
        images: normalizeImages(data),
        created_at: toIsoDate(data.created_at)
      };
    });

    logProductDiagnostics(products, firebase.projectId);
    return products;
  } catch (error) {
    console.warn(`Products: Firestore query failed for project ${firebase.projectId || "unknown"}. ${getErrorMessage(error)} Falling back to ${demoProducts.length} demo product(s).`);
    return demoProducts;
  }
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((product) => product.slug === slug);
}
