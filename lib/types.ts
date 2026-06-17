export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  images: string[];
  created_at?: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
