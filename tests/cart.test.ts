import { describe, expect, it } from 'vitest';
import { demoProducts } from '../src/data/demo';
import {
  orderMessage,
  reconcile,
  restoreCart,
  total,
  validProduct,
  validQuantity,
} from '../src/domain/catalog';
const product = demoProducts[0];
describe('Carrito y mensaje', () => {
  it('acepta solo cantidades enteras positivas y acotadas', () => {
    for (const q of [0, -1, 1.1, NaN, Infinity, 10000]) expect(validQuantity(q)).toBe(false);
    expect(validQuantity(3)).toBe(true);
  });
  it('recupera almacenamiento corrupto sin romper la página', () => {
    expect(restoreCart('{')).toEqual([]);
    expect(restoreCart('{}')).toEqual([]);
    expect(restoreCart(JSON.stringify([{ product, quantity: 0 }]))).toEqual([]);
  });
  it('elimina duplicados restaurados', () => {
    expect(
      restoreCart(
        JSON.stringify([
          { product, quantity: 2 },
          { product, quantity: 1 },
        ]),
      ),
    ).toHaveLength(1);
  });
  it('calcula en unidades menores y genera solo los campos solicitados', () => {
    const lines = [{ product, quantity: 3 }];
    expect(total(lines)).toBe(3600);
    const text = orderMessage(lines, (n) => (n / 100).toFixed(2));
    expect(text).toBe('Pieza de ejemplo 01 — Cantidad: 3 — Precio: 12.00\nTotal del pedido: 36.00');
  });
  it('actualiza precios y requiere revisión', () => {
    const r = reconcile([{ product, quantity: 2 }], [{ ...product, priceMinor: 1500 }]);
    expect(r.changes).toHaveLength(1);
    expect(total(r.lines)).toBe(3000);
  });
  it('retira agotados y productos eliminados', () => {
    expect(
      reconcile([{ product, quantity: 1 }], [{ ...product, availability: 'agotado' }]).lines,
    ).toEqual([]);
    expect(reconcile([{ product, quantity: 1 }], []).changes).toHaveLength(1);
  });
  it('publica mayor opcional sin cambiar totales ni mensaje al detal', () => {
    const p = { ...product, wholesalePriceMinor: 900 };
    const lines = [{ product: p, quantity: 20 }];
    expect(total(lines)).toBe(24000);
    expect(orderMessage(lines, String)).toBe(
      'Pieza de ejemplo 01 — Cantidad: 20 — Precio: 1200\nTotal del pedido: 24000',
    );
    expect(reconcile([{ product, quantity: 20 }], [p]).changes).toEqual([]);
  });
  it('permite productos con y sin precio al mayor y valida el precio opcional', () => {
    expect(validProduct(product)).toBe(true);
    expect(validProduct({ ...product, wholesalePriceMinor: 900 })).toBe(true);
    expect(validProduct({ ...product, wholesalePriceMinor: -1 })).toBe(false);
  });
  it('no prepara carritos vacíos ni cantidades inválidas', () => {
    expect(() => orderMessage([], String)).toThrow();
    expect(() => orderMessage([{ product, quantity: 0 }], String)).toThrow();
  });
});
