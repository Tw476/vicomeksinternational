import { Timestamp, type QuerySnapshot } from "firebase-admin/firestore";
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

const productsQueryTimeoutMs = Number(process.env.PRODUCTS_QUERY_TIMEOUT_MS || 10000);

function toIsoDate(value: unknown) {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return undefined;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function shouldUseDemoFallback() {
  return process.env.NODE_ENV !== "production";
}

function returnDemoProducts(reason: string): Product[] {
  if (!shouldUseDemoFallback()) {
    throw new Error(`Products: ${reason}; refusing to return ${demoProducts.length} demo product(s) in production.`);
  }

  console.warn(`Products: ${reason}; falling back to ${demoProducts.length} demo product(s).`);
  return demoProducts;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms.`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
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

export async function getProducts(): Promise<Product[]> {
  noStore();

  const firebase = getFirebaseAdmin();
  if (!firebase) {
    return returnDemoProducts("Firebase Admin unavailable");
  }

  try {
    const snapshot = await withTimeout<QuerySnapshot>(
      firebase.db.collection(productsCollection).orderBy("created_at", "desc").get(),
      productsQueryTimeoutMs,
      `Firestore products query for ${productsCollection}`
    );
    if (snapshot.empty) {
      return returnDemoProducts(`Firestore query returned 0 product(s) from project ${firebase.projectId || "unknown"} at collection ${productsCollection}`);
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

    return products;
  } catch (error) {
    return returnDemoProducts(`Firestore query failed for project ${firebase.projectId || "unknown"} at collection ${productsCollection}. ${getErrorMessage(error)}`);
  }
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((product) => product.slug === slug);
}
