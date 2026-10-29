export type Product = {
  id: string;
  name: string;
  description: string;
  priceMinor: number;
  wholesalePriceMinor: number | null;
  availability: 'bajo_pedido' | 'agotado';
  images: string[];
};
export type CartLine = { product: Product; quantity: number };
export const MAX_QUANTITY = 9999;
export function validQuantity(q: number) {
  return Number.isInteger(q) && q > 0 && q <= MAX_QUANTITY;
}
export function validProduct(p: unknown): p is Product {
  if (!p || typeof p !== 'object') return false;
  const x = p as Product;
  return (
    typeof x.id === 'string' &&
    /^[a-zA-Z0-9_-]{1,128}$/.test(x.id) &&
    typeof x.name === 'string' &&
    x.name.trim().length > 0 &&
    x.name.length <= 120 &&
    typeof x.description === 'string' &&
    x.description.length <= 1000 &&
    Number.isInteger(x.priceMinor) &&
    x.priceMinor >= 0 &&
    x.priceMinor <= 100000000 &&
    (x.wholesalePriceMinor === null ||
      (Number.isInteger(x.wholesalePriceMinor) &&
        x.wholesalePriceMinor >= 0 &&
        x.wholesalePriceMinor <= x.priceMinor)) &&
    ['bajo_pedido', 'agotado'].includes(x.availability) &&
    Array.isArray(x.images) &&
    x.images.length <= 6 &&
    x.images.every((u) => typeof u === 'string' && /^https:\/\//.test(u))
  );
}
export function restoreCart(raw: string | null): CartLine[] {
  try {
    const parsed: unknown = JSON.parse(raw || '[]');
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    return parsed
      .filter(
        (x): x is CartLine =>
          !!x &&
          validProduct(x.product) &&
          validQuantity(x.quantity) &&
          !seen.has(x.product.id) &&
          !!seen.add(x.product.id),
      )
      .slice(0, 100);
  } catch {
    return [];
  }
}
export function reconcile(cart: CartLine[], products: Product[]) {
  const changes: string[] = [];
  const lines = cart.flatMap((line) => {
    const current = products.find((p) => p.id === line.product.id);
    if (!current || current.availability === 'agotado') {
      changes.push(`${line.product.name}: ya no está disponible; se retiró del carrito.`);
      return [];
    }
    if (current.priceMinor !== line.product.priceMinor)
      changes.push(`${current.name}: cambió el precio. Revisa el nuevo total.`);
    return [{ product: current, quantity: line.quantity }];
  });
  return { lines, changes };
}
export function total(cart: CartLine[]) {
  return cart.reduce((sum, line) => sum + line.product.priceMinor * line.quantity, 0);
}
export function orderMessage(cart: CartLine[], format: (n: number) => string) {
  if (
    !cart.length ||
    cart.some((l) => !validQuantity(l.quantity) || l.product.availability === 'agotado')
  )
    throw new Error('Revisa el carrito.');
  return [
    ...cart.map(
      (line) =>
        `${line.product.name} — Cantidad: ${line.quantity} — Precio: ${format(line.product.priceMinor)}`,
    ),
    `Total del pedido: ${format(total(cart))}`,
  ].join('\n');
}
