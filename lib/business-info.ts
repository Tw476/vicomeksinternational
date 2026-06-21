export const businessName = "Vicomeks International";

export const businessPhone = "08034362610";
export const businessPhoneHref = "+2348034362610";
export const businessEmail = "vicomeks1@gmail.com";
export const businessLocation = "Ojo, Lagos, Nigeria";

export const businessAddressLines = [
  "Ojo",
  "Lagos",
  "Nigeria"
];

export const businessAddress = businessAddressLines.join(", ");

export const whatsappHref = "https://wa.me/2348034362610";

export function whatsappProductHref(productName?: string, productUrl?: string) {
  const text = productName
    ? `Hello Vicomeks International,\n\nI am interested in the following product from your website:\n\nProduct: ${productName}\n\nProduct Link:\n${productUrl || ""}\n\nCould you please provide availability, specifications, and delivery details?\n\nThank you.`
    : "Hello, I want to make an inquiry with Vicomeks International.";

  return `${whatsappHref}?text=${encodeURIComponent(text)}`;
}
