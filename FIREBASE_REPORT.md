# Firestore and Cloudinary Migration Report

## Summary

The Vicomeksint'l Next.js storefront/admin app now uses Firestore for product data and Cloudinary for product image hosting.

The backend now uses:

- Firestore product records in the `products` collection.
- Cloudinary product image uploads and hosted image URLs.
- Server-only admin access through the Firebase Admin SDK.

The app still falls back to demo products when Firebase credentials are not configured, so local development can continue without a Firebase project.

## Main Code Changes

- Added `firebase-admin` as the backend Firebase SDK dependency.
- Added `cloudinary` as the image upload dependency.
- Added `lib/firebase-admin.ts` for Firebase Admin initialization and Firestore access.
- Added `lib/cloudinary.ts` for Cloudinary configuration and image uploads.
- Updated `lib/products.ts` to read products from Firestore.
- Updated `app/api/admin/products/upload/route.ts` so single product uploads save images to Cloudinary and product records to Firestore.
- Updated `app/api/admin/bulk-import/route.ts` so bulk imports save images to Cloudinary and product records to Firestore.
- Removed Firebase Storage usage and the `FIREBASE_STORAGE_BUCKET` requirement.
- Updated `.env.example` with Firebase service-account variables and Cloudinary credentials.
- Kept Firestore rule examples in `firebase/firestore.rules`.

## Required Setup

Create a Firebase project with:

- Firestore Database enabled.
- A service account key for the Next.js server.

Create or use a Cloudinary account with:

- Cloud name.
- API key.
- API secret.

Add these environment variables:

```env
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ADMIN_PASSWORD=change-this-secure-password
```

For `FIREBASE_PRIVATE_KEY`, keep the newline escapes as `\n` if storing it in a `.env` file.

Alternative Firebase credential option:

```env
FIREBASE_SERVICE_ACCOUNT_BASE64=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ADMIN_PASSWORD=change-this-secure-password
```

`FIREBASE_SERVICE_ACCOUNT_BASE64` should be a base64-encoded Firebase service account JSON file.

## Firestore Product Shape

Collection: `products`

Document ID: product slug, for example `panasonic-power-blender`

Fields:

```ts
{
  id: string;
  name: string;
  slug: string;
  category: string;
  images: string[];
  created_at: FirebaseFirestore.Timestamp;
}
```

## Cloudinary Uploads

Uploaded product images are saved to Cloudinary under folders like:

```txt
vicomeksint/products/{product-slug}
```

The app stores each returned Cloudinary `secure_url` in the Firestore product document `images` array.

## Security Notes

- The app uses Firebase Admin SDK only on the server.
- Browser users do not receive Firebase service credentials.
- Browser users do not receive Cloudinary API secrets.
- Admin protection still uses the existing password cookie flow.
- Firestore rules in this repo deny direct client access because product reads/writes happen through the Next.js server.

## Verification

- `npm run build` passes.
- Product image upload code no longer depends on Firebase Storage.
- Single product upload and bulk import now upload images through Cloudinary, then save Cloudinary URLs to Firestore.

## Next Recommended Work

- Add an order checkout API that saves orders to Firestore.
- Replace the password-only admin flow with Firebase Auth custom claims if multiple admin users are needed.
- Add product editing/deleting routes in Firestore.
- Add deployment environment variables for Firebase and Cloudinary.
