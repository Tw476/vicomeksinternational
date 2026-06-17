import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BadgeCheck, CheckCircle2, Clock, MapPin, MessageCircle, PackageCheck, Phone, ShieldCheck, Store, Truck, Users } from "lucide-react";
import { MotionDiv, MotionSection } from "@/components/motion";
import { ProductCard } from "@/components/products/product-card";
import { businessAddressLines, businessPhone, whatsappHref } from "@/lib/business-info";
import { getProducts } from "@/lib/products";

const businessAreas = [
  ["Industrial & Commercial Kitchen Equipment", "Heavy-duty equipment for food production, hotels, restaurants, bakeries, and institutional kitchens."],
  ["Kitchen & Household Appliances", "Reliable appliances for everyday home use, food preparation, cleaning, and kitchen support."],
  ["Refrigeration & Cooling Systems", "Cooling and refrigeration systems for homes, stores, restaurants, hotels, and commercial buyers."],
  ["Air Conditioning Systems", "Air conditioning systems and cooling support for residential, office, retail, and business spaces."],
  ["Laundry Equipment", "Washing, drying, ironing, and laundry support equipment for homes and businesses."],
  ["Hair & Body Care Equipment", "Grooming and personal care equipment for salons, barbers, retailers, and household buyers."],
  ["General Merchandise", "A broad merchandise range for dealers, projects, procurement teams, and everyday retail demand."]
];

const homepageCategoryCards = [
  {
    title: "Industrial & Commercial Kitchen Equipment",
    description: "Heavy-duty equipment for food production, hotels, restaurants, bakeries, and institutional kitchens.",
    groups: [
      "Industrial Ovens",
      "Industrial Mixers",
      "Commercial Work Tables",
      "Snack Warmers",
      "Display Warmers",
      "BBQ Machines",
      "Commercial Food Preparation Equipment",
      "Related Industrial Kitchen Equipment"
    ]
  },
  {
    title: "Kitchen & Household Appliances",
    description: "Appliances for food preparation, cooking, cleaning, serving, and everyday household support.",
    groups: [
      "Blenders",
      "Microwaves",
      "Juicers",
      "Coffee Machines",
      "Air Fryers",
      "Vacuum Cleaners",
      "Steam Irons",
      "Deep Fryers",
      "Sandwich Makers",
      "Toasters",
      "Grillers",
      "Sensor Bins",
      "Water Dispensers",
      "Kitchen Hoods",
      "Gas Cookers",
      "Electric Kettles"
    ]
  },
  {
    title: "Refrigeration & Cooling Systems",
    description: "Refrigerators, freezers, chillers, and cooling systems for home and commercial use."
  },
  {
    title: "Air Conditioning Systems",
    description: "Cooling solutions for homes, offices, stores, hospitality spaces, and business facilities."
  },
  {
    title: "Laundry Equipment",
    description: "Washing, drying, ironing, and garment-care equipment for homes and businesses."
  },
  {
    title: "Hair & Body Care Equipment",
    description: "Personal care and grooming equipment for salons, barbers, retailers, and household buyers."
  },
  {
    title: "General Merchandise",
    description: "A broad range of merchandise for dealers, procurement teams, projects, and retail demand."
  }
];

const trustHighlights: Array<[LucideIcon, string, string]> = [
  [ShieldCheck, "Trusted Importer and Distributor", "Direct sourcing support for serious buyers looking for dependable equipment, appliances, and general merchandise."],
  [Store, "Wholesale and Retail Sales", "Flexible quantities for dealers, businesses, procurement teams, project buyers, and household customers."],
  [Truck, "Fast Nationwide Delivery", "Responsive pickup and delivery coordination from Alaba International Market to customers across Nigeria."],
  [PackageCheck, "Quality Assurance", "Products are presented with clear images, category details, and practical sales support before purchase."],
  [MessageCircle, "WhatsApp Quick Inquiry", "Ask for current price, availability, delivery timing, and order options directly from the product page."]
];

const stats = [
  ["7", "Core product categories"],
  ["24hr", "Fast inquiry response target"],
  ["Nationwide", "Delivery coordination"],
  ["Wholesale", "and retail support"]
];

export default async function HomePage() {
  const products = await getProducts();
  const featured = products.slice(0, 8);
  const arrivals = products.slice(8, 12);
  const hasMoreProducts = products.length > 12;

  return (
    <main>
      <section className="overflow-hidden bg-ink text-white">
        <div className="container-pad grid min-h-[calc(100vh-80px)] items-center gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:py-16">
          <MotionDiv initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-xl">
            <Image src="/logo.jpeg" alt="Vicomeks International logo" width={96} height={96} className="h-20 w-20 rounded-md border border-gold/35 object-cover shadow-premium sm:h-24 sm:w-24" priority />
            <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-6xl">Vicomeks International</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/75">
              Dealers in industrial and commercial kitchen equipment, kitchen and household appliances, refrigeration and cooling systems, air conditioning systems, laundry equipment, hair and body care equipment, and general merchandise.
            </p>
            <div className="mt-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Dealers in:</p>
              <ul className="mt-4 grid gap-2 text-sm leading-6 text-white/80 sm:grid-cols-2">
                {[
                  "Industrial & Commercial Kitchen Equipment",
                  "Kitchen & Household Appliances",
                  "Refrigeration & Cooling Systems",
                  "Air Conditioning Systems",
                  "Laundry Equipment",
                  "Hair & Body Care Equipment",
                  "General Merchandise"
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/shop" prefetch className="gold-ring inline-flex items-center justify-center gap-2 rounded-md bg-gold px-6 py-4 text-sm font-semibold text-ink hover:bg-white">
                View products <ArrowRight size={17} />
              </Link>
              <a href={whatsappHref} className="gold-ring inline-flex items-center justify-center gap-2 rounded-md border border-white/25 px-6 py-4 text-sm font-semibold text-white hover:bg-white hover:text-ink">
                <MessageCircle size={17} /> WhatsApp us
              </a>
            </div>
          </MotionDiv>
          <MotionDiv initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="relative min-h-[320px] overflow-hidden rounded-lg border border-white/10 shadow-premium sm:min-h-[460px] lg:min-h-[620px]">
            <Image src="/frontpage.jpg" alt="Vicomeks International appliance and equipment showroom" fill className="object-cover" priority sizes="(max-width: 1023px) 100vw, 54vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </MotionDiv>
        </div>
      </section>

      <MotionSection initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="container-pad py-16">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Featured stock</p>
            <h2 className="mt-2 text-3xl font-semibold">Available product highlights</h2>
            <p className="mt-3 max-w-2xl text-black/60">Selected products for homes, businesses, dealers, restaurants, hotels, salons, laundries, and procurement teams.</p>
          </div>
          <Link href="/shop" prefetch className="hidden text-sm font-semibold text-ink hover:text-gold sm:block">View all</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {featured.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </MotionSection>

      <section className="bg-white py-16">
        <div className="container-pad">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Category range</p>
          <h2 className="mt-2 text-3xl font-semibold">Built for wholesale and retail buyers</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {homepageCategoryCards.map((category) => (
              <Link key={category.title} href="/shop" prefetch className="rounded-lg border border-black/10 bg-[#faf8f2] p-5 transition hover:border-gold hover:bg-champagne">
                <h3 className="text-base font-semibold text-ink">{category.title}</h3>
                <p className="mt-3 text-sm leading-6 text-black/60">{category.description}</p>
                {category.groups ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {category.groups.map((group) => (
                      <span key={group} className="rounded-md border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-black/65">
                        {group}
                      </span>
                    ))}
                  </div>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-pad py-16">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Professional range</p>
          <h2 className="mt-2 text-3xl font-semibold">Equipment and merchandise for every buying channel</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {businessAreas.map(([title, text]) => (
            <article key={title} className="rounded-lg border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-gold hover:shadow-premium">
              <h3 className="font-semibold text-ink">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-black/60">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <MotionSection initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white py-16">
        <div className="container-pad">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Why Choose Vicomeks International</p>
            <h2 className="mt-2 text-3xl font-semibold">A reliable source for equipment, appliances, and merchandise.</h2>
            <p className="mt-4 text-black/60">Vicomeks International supports buyers who need dependable sourcing, clear product inquiry, and practical delivery coordination for personal, commercial, and resale needs.</p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {trustHighlights.map(([Icon, title, text]) => (
              <article key={title} className="rounded-lg border border-black/10 bg-[#faf8f2] p-5 transition hover:border-gold hover:bg-champagne">
                <Icon className="text-gold" size={24} />
                <h3 className="mt-5 font-semibold text-ink">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-black/60">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </MotionSection>

      <section className="container-pad py-16">
        <div className="grid gap-8 rounded-lg bg-ink p-8 text-white shadow-premium md:grid-cols-[.9fr_1.1fr] md:p-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Professional statistics</p>
            <h2 className="mt-3 text-3xl font-semibold">Built for buyers who need speed, clarity, and product confidence.</h2>
            <p className="mt-4 text-white/65">From single-item retail requests to wider wholesale sourcing, the sales process is structured around fast inquiry handling and clear product identification.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map(([value, label]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                <p className="text-2xl font-semibold text-gold">{value}</p>
                <p className="mt-2 text-sm leading-6 text-white/65">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-pad py-16">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">New arrivals</p>
          <h2 className="mt-2 text-3xl font-semibold">Freshly added products</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {arrivals.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
        {hasMoreProducts ? (
          <div className="mt-8 flex justify-center">
            <Link href="/shop" prefetch className="gold-ring inline-flex items-center justify-center gap-2 rounded-md bg-ink px-6 py-4 text-sm font-semibold text-white hover:bg-gold hover:text-ink">
              View More Products <ArrowRight size={17} />
            </Link>
          </div>
        ) : null}
      </section>

      <section className="bg-ink py-16 text-white">
        <div className="container-pad grid gap-5 md:grid-cols-4">
          {([
            [ShieldCheck, "Importer confidence", "Professional sourcing support for equipment and appliance buyers."],
            [Truck, "Pickup and delivery", "Smooth Alaba pickup and delivery coordination."],
            [BadgeCheck, "Wholesale and retail", "Support for dealers, businesses, projects, and household customers."],
            [Clock, "Quick inquiry", "Get availability and product responses directly on WhatsApp."]
          ] as Array<[LucideIcon, string, string]>).map(([Icon, title, text]) => (
            <div key={String(title)} className="rounded-lg border border-white/10 p-5">
              <Icon className="text-gold" size={24} />
              <h3 className="mt-5 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/60">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-pad grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Ready to source?</p>
            <h2 className="mt-2 max-w-3xl text-3xl font-semibold">Send a quick inquiry and get current price, availability, and delivery details.</h2>
            <p className="mt-4 max-w-2xl text-black/60">Browse the shop, open the product you need, and use WhatsApp Quick Inquiry so the team can identify the exact product immediately.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <Link href="/shop" prefetch className="gold-ring inline-flex items-center justify-center gap-2 rounded-md bg-ink px-6 py-4 text-sm font-semibold text-white hover:bg-gold hover:text-ink">
              Browse products <ArrowRight size={17} />
            </Link>
            <a href={whatsappHref} className="gold-ring inline-flex items-center justify-center gap-2 rounded-md border border-black/15 px-6 py-4 text-sm font-semibold hover:border-gold hover:bg-champagne">
              <MessageCircle size={17} /> WhatsApp us
            </a>
          </div>
        </div>
      </section>

      <section className="container-pad py-16">
        <div className="grid gap-8 rounded-lg bg-white p-8 shadow-premium md:grid-cols-[1.1fr_.9fr] md:p-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Contact</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold">Need equipment, appliances, or merchandise?</h2>
            <p className="mt-4 max-w-2xl text-black/60">Talk to Vicomeks International for current availability, product images, wholesale and retail quantities, pickup, and delivery options.</p>
            <a href={whatsappHref} className="gold-ring mt-7 inline-flex items-center gap-2 rounded-md bg-ink px-6 py-4 text-sm font-semibold text-white hover:bg-gold hover:text-ink">
              <MessageCircle size={17} /> Chat on WhatsApp
            </a>
          </div>
          <div className="grid gap-4 rounded-lg border border-black/10 bg-[#faf8f2] p-5">
            <div className="flex items-start gap-3 text-sm leading-6 text-black/70">
              <CheckCircle2 size={18} className="mt-1 shrink-0 text-gold" />
              <span>Importer, distributor, wholesale, and retail sales support.</span>
            </div>
            <div className="flex items-start gap-3 text-sm leading-6 text-black/70">
              <Users size={18} className="mt-1 shrink-0 text-gold" />
              <span>Responsive sales guidance for product selection and delivery planning.</span>
            </div>
            <a href={`tel:${businessPhone.replace(/\s/g, "")}`} className="flex items-center gap-3 text-sm font-semibold text-ink hover:text-gold">
              <Phone size={18} className="text-gold" /> {businessPhone}
            </a>
            <div className="flex items-start gap-3 text-sm leading-6 text-black/70">
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
