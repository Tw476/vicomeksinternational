import Link from "next/link";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { businessAddressLines, businessName, businessPhone, whatsappHref } from "@/lib/business-info";

export const clientPhone = businessPhone;
export { whatsappHref };

export function SiteFooter() {
  return (
    <footer className="bg-ink text-white">
      <div className="container-pad grid gap-8 py-12 md:grid-cols-[1.2fr_.8fr_.8fr]">
        <div>
          <p className="text-lg font-semibold">{businessName}</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/65">
            Dealers in industrial and commercial kitchen equipment, kitchen and household appliances, refrigeration and cooling systems, air conditioning systems, laundry equipment, hair and body care equipment, and general merchandise.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gold">Contact</p>
          <a href={`tel:${clientPhone.replace(/\s/g, "")}`} className="mt-3 flex items-center gap-2 text-sm text-white/75 hover:text-white">
            <Phone size={16} /> {clientPhone}
          </a>
          <div className="mt-3 flex items-start gap-2 text-sm leading-6 text-white/75">
            <MapPin className="mt-1 shrink-0" size={16} />
            <address className="not-italic">
              {businessAddressLines.map((line) => <span key={line} className="block">{line}</span>)}
            </address>
          </div>
          <a href={whatsappHref} className="mt-3 flex items-center gap-2 text-sm text-white/75 hover:text-white">
            <MessageCircle size={16} /> WhatsApp inquiry
          </a>
        </div>
        <div>
          <p className="text-sm font-semibold text-gold">Quick Links</p>
          <div className="mt-3 grid gap-2 text-sm text-white/75">
            <Link href="/shop" prefetch className="hover:text-white">Shop products</Link>
            <Link href="/contact" prefetch className="hover:text-white">Contact us</Link>
            <Link href="/cart" prefetch className="hover:text-white">View cart</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
