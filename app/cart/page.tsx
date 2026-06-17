import { CartView } from "@/components/cart/cart-view";

export default function CartPage() {
  return (
    <main className="container-pad py-12">
      <h1 className="mb-8 text-4xl font-semibold">Cart</h1>
      <CartView />
    </main>
  );
}
