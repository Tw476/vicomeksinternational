import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

type FirebaseServices = {
  app: App;
  db: Firestore;
};

const serviceAccountPath = path.join(process.cwd(), "firebase-service-account.json");

function getServiceAccount() {
  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (encoded) {
    console.log("Firebase Admin: using FIREBASE_SERVICE_ACCOUNT_BASE64 credentials.");
    return JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    console.log("Firebase Admin: using FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY credentials.");
    return { projectId, clientEmail, privateKey };
  }

  if (existsSync(serviceAccountPath)) {
    console.log(`Firebase Admin: using service account file at ${serviceAccountPath}.`);
    return JSON.parse(readFileSync(serviceAccountPath, "utf8"));
  }

  console.log("Firebase Admin: no credentials found in environment variables or firebase-service-account.json.");
  return null;
}

export function getFirebaseAdmin(): FirebaseServices | null {
  const serviceAccount = getServiceAccount();
  if (!serviceAccount) return null;

  const app =
    getApps()[0] ||
    initializeApp({
      credential: cert(serviceAccount)
    });

  return {
    app,
    db: getFirestore(app)
  };
}

export function requireFirebaseAdmin(): FirebaseServices {
  const services = getFirebaseAdmin();
  if (!services) {
    throw new Error("Missing Firebase admin environment variables.");
  }
  return services;
}

export const productsCollection = "products";
