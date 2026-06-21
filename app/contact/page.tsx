import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { businessAddressLines, businessEmail, businessName, businessPhone, businessPhoneHref, whatsappHref } from "@/lib/business-info";

export default function ContactPage() {
  return (
    <main className="container-pad py-12">
      <section className="grid gap-8 rounded-lg bg-white p-8 shadow-premium md:grid-cols-[1fr_.9fr] md:p-12">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Contact</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight">{businessName}</h1>
          <p className="mt-4 max-w-2xl text-black/60">
            Contact us for industrial and commercial kitchen equipment, kitchen and household appliances, refrigeration and cooling systems, air conditioning systems, laundry equipment, hair and body care equipment, and general merchandise.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a href={whatsappHref} className="gold-ring inline-flex items-center justify-center gap-2 rounded-md bg-ink px-6 py-4 text-sm font-semibold text-white hover:bg-gold hover:text-ink">
              <MessageCircle size={17} /> Chat on WhatsApp
            </a>
            <a href={`tel:${businessPhoneHref}`} className="gold-ring inline-flex items-center justify-center gap-2 rounded-md border border-black/15 px-6 py-4 text-sm font-semibold hover:border-gold hover:bg-champagne">
              <Phone size={17} /> Call {businessPhone}
            </a>
          </div>
        </div>
        <div className="grid gap-5 rounded-lg border border-black/10 bg-[#faf8f2] p-6">
          <div>
            <p className="font-semibold text-ink">Phone / WhatsApp</p>
            <a href={`tel:${businessPhoneHref}`} className="mt-3 flex items-center gap-3 text-sm font-semibold text-ink hover:text-gold">
              <Phone size={18} className="text-gold" /> {businessPhone}
            </a>
          </div>
          <div>
            <p className="font-semibold text-ink">Email</p>
            <a href={`mailto:${businessEmail}`} className="mt-3 flex items-center gap-3 text-sm font-semibold text-ink hover:text-gold">
              <Mail size={18} className="text-gold" /> {businessEmail}
            </a>
          </div>
          <div>
            <p className="font-semibold text-ink">Location</p>
            <div className="mt-3 flex items-start gap-3 text-sm leading-6 text-black/70">
              <MapPin size={18} className="mt-1 shrink-0 text-gold" />
              <address className="not-italic">
                {businessAddressLines.map((line) => <span key={line} className="block">{line}</span>)}
              </address>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
