export type ProductSize = 'Small' | 'Medium' | 'Large' | 'XL' | '2X' | '3X';

export type Product = {
  slug: string;
  /** Short name, e.g. "Created to Create" */
  title: string;
  /** e.g. "Oversized Hoodie" */
  descriptor: string;
  /** e.g. "Grey" */
  color: string;
  priceCents: number;
  currency: 'USD';
  images: { src: string; alt: string }[];
  sizes: ProductSize[];
  /** Physical units on hand per size (0 = sold out for that size). */
  inventoryBySize: Record<ProductSize, number>;
};

export const SIZE_ORDER: ProductSize[] = ['Small', 'Medium', 'Large', 'XL', '2X', '3X'];

const SIZE_ABBREV: Record<ProductSize, string> = {
  Small: 'S',
  Medium: 'M',
  Large: 'L',
  XL: 'XL',
  '2X': '2X',
  '3X': '3X',
};

export const PRODUCTS: Product[] = [
  {
    slug: 'created-to-create-oversized-hoodie-grey',
    title: 'Created to Create',
    descriptor: 'Oversized Hoodie',
    color: 'Grey',
    priceCents: 6000,
    currency: 'USD',
    images: [
      { src: '/frontside_transparent.webp', alt: 'Created to Create hoodie (front)' },
      { src: '/backside_transparent.webp', alt: 'Created to Create hoodie (back)' },
    ],
    sizes: ['Small', 'Medium', 'Large', 'XL', '2X', '3X'],
    inventoryBySize: {
      Small: 0,
      Medium: 0,
      Large: 2,
      XL: 3,
      '2X': 3,
      '3X': 4,
    },
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getStock(product: Product, size: ProductSize): number {
  return product.inventoryBySize[size] ?? 0;
}

export function getInStockSizes(product: Product): ProductSize[] {
  return SIZE_ORDER.filter((s) => product.sizes.includes(s) && getStock(product, s) > 0);
}

export function getTotalStock(product: Product): number {
  return product.sizes.reduce((sum, s) => sum + getStock(product, s), 0);
}

/** BenoWrld-style urgency when stock is low (1–5 units for that size). */
export function stockLabelForSize(product: Product, size: ProductSize): string | null {
  const n = getStock(product, size);
  if (n <= 0) return null;
  if (n <= 5) return `Only ${n} left in stock`;
  return null;
}

/**
 * One-line summary for shop card: e.g. "S & M sold out · L, XL, 2X, 3X in stock · 12 total"
 */
export function getShopAvailabilitySummary(product: Product): string {
  const total = getTotalStock(product);
  if (total === 0) {
    return 'All sizes sold out';
  }

  const soldOut = SIZE_ORDER.filter((s) => product.sizes.includes(s) && getStock(product, s) === 0);
  const inStock = getInStockSizes(product);

  const soldOutPart =
    soldOut.length === 0
      ? ''
      : soldOut.length === 1
        ? `${SIZE_ABBREV[soldOut[0]!]} sold out`
        : `${soldOut.map((s) => SIZE_ABBREV[s]).join(' & ')} sold out`;

  const inStockPart = `${inStock.map((s) => SIZE_ABBREV[s]).join(', ')} in stock`;
  const totalPart = ` · ${total} total`;

  if (soldOut.length === 0) {
    return `${inStockPart}${totalPart}`;
  }
  return `${soldOutPart} · ${inStockPart}${totalPart}`;
}

export function getDefaultSize(product: Product): ProductSize {
  const inStock = getInStockSizes(product);
  return inStock[0] ?? 'Large';
}
