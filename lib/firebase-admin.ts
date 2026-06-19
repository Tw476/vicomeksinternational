import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

type FirebaseServices = {
  app: App;
  db: Firestore;
  databaseId: string;
  projectId?: string;
};

const serviceAccountPath = path.join(process.cwd(), "firebase-service-account.json");
const firestoreDatabaseId = process.env.FIRESTORE_DATABASE_ID || "(default)";

function normalizePrivateKey(value: string) {
  return value
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n");
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function getServiceAccountProjectId(serviceAccount: unknown) {
  if (!serviceAccount || typeof serviceAccount !== "object") return undefined;

  const account = serviceAccount as { projectId?: unknown; project_id?: unknown };
  if (typeof account.projectId === "string") return account.projectId;
  if (typeof account.project_id === "string") return account.project_id;
  return undefined;
}

function normalizeServiceAccount(serviceAccount: unknown) {
  if (!serviceAccount || typeof serviceAccount !== "object") return serviceAccount;

  const account = serviceAccount as Record<string, unknown>;
  const privateKey = account.privateKey || account.private_key;
  if (typeof privateKey === "string") {
    const normalizedPrivateKey = normalizePrivateKey(privateKey);
    return {
      ...account,
      privateKey: normalizedPrivateKey,
      private_key: normalizedPrivateKey
    };
  }

  return account;
}

function getServiceAccount() {
  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (encoded) {
    try {
      const serviceAccount = normalizeServiceAccount(JSON.parse(Buffer.from(encoded, "base64").toString("utf8")));
      return serviceAccount;
    } catch (error) {
      console.warn(`Firebase Admin: invalid FIREBASE_SERVICE_ACCOUNT_BASE64 credentials. ${getErrorMessage(error)}`);
      return null;
    }
  }

  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (rawServiceAccount) {
    try {
      const serviceAccount = normalizeServiceAccount(JSON.parse(rawServiceAccount));
      return serviceAccount;
    } catch (error) {
      console.warn(`Firebase Admin: invalid FIREBASE_SERVICE_ACCOUNT credentials. ${getErrorMessage(error)}`);
      return null;
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY ? normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY) : undefined;

  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }

  if (existsSync(serviceAccountPath)) {
    try {
      const serviceAccount = normalizeServiceAccount(JSON.parse(readFileSync(serviceAccountPath, "utf8")));
      return serviceAccount;
    } catch (error) {
      console.warn(`Firebase Admin: invalid service account file at ${serviceAccountPath}. ${getErrorMessage(error)}`);
      return null;
    }
  }

  return null;
}

export function getFirebaseAdmin(): FirebaseServices | null {
  const serviceAccount = getServiceAccount();
  if (!serviceAccount) return null;

  try {
    const app =
      getApps()[0] ||
      initializeApp({
        credential: cert(serviceAccount)
      });

    return {
      app,
      db: firestoreDatabaseId === "(default)" ? getFirestore(app) : getFirestore(app, firestoreDatabaseId),
      databaseId: firestoreDatabaseId,
      projectId: getServiceAccountProjectId(serviceAccount)
    };
  } catch (error) {
    console.warn(`Firebase Admin: failed to initialize Firebase Admin SDK. ${getErrorMessage(error)}`);
    return null;
  }
}

export function requireFirebaseAdmin(): FirebaseServices {
  const services = getFirebaseAdmin();
  if (!services) {
    throw new Error("Missing Firebase admin environment variables.");
  }
  return services;
}

export const productsCollection = "products";
