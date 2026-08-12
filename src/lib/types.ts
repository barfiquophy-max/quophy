export type Product = {
  code: string;
  slug: string;
  name: string;
  price: number | null;
  salePrice: number | null;
  color: string;
  extraColors: number;
  images: string[];
  sizes: string[];
  description: string;
  bullets: string[];
  composition: string;
  newSeason: boolean;
  categories: string[];
  gender: string;
  group: string;
  sub: string | null;
};

export type Category = {
  slug: string;
  gender: string;
  group: string;
  sub: string | null;
  title: string;
  label: string;
  totalItems: number;
  productCodes: string[];
};

export type EditorialBlock = {
  title: string;
  ctas: { label: string; href: string }[];
  image: string | null;
  mobileImage: string | null;
  video: string | null;
};

export type CartLine = {
  code: string;
  size: string;
  quantity: number;
};

export type Address = {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type Order = {
  id: string;
  createdAt: string;
  lines: (CartLine & { name: string; price: number; image: string; color: string })[];
  total: number;
  address: Address;
  status: string;
};
