import type { Metadata } from "next";
import { CartProvider } from "@/components/cart/cart-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vicomeks International | Equipment, Appliances & General Merchandise",
  description: "Vicomeks International deals in industrial and commercial kitchen equipment, kitchen and household appliances, refrigeration and cooling systems, air conditioning systems, laundry equipment, hair and body care equipment, and general merchandise in Lagos, Nigeria."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
