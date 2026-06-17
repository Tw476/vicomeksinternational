import { Timestamp } from "firebase-admin/firestore";
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

export async function getProducts(): Promise<Product[]> {
  const firebase = getFirebaseAdmin();
  if (!firebase) return demoProducts;

  try {
    const snapshot = await firebase.db.collection(productsCollection).orderBy("created_at", "desc").get();
    if (snapshot.empty) return demoProducts;

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: String(data.name || ""),
        slug: String(data.slug || doc.id),
        category: String(data.category || "Uncategorized"),
        images: Array.isArray(data.images) ? data.images.map(String) : [],
        created_at: toIsoDate(data.created_at)
      };
    });
  } catch {
    return demoProducts;
  }
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((product) => product.slug === slug);
}
