import { CheckoutForm } from "@/components/cart/checkout-form";

export default function CheckoutPage() {
  return (
    <main className="container-pad py-12">
      <h1 className="mb-8 text-4xl font-semibold">Checkout</h1>
      <CheckoutForm />
    </main>
  );
}
