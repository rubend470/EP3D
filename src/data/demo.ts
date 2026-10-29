import type { Product } from '../domain/catalog';
// Ejemplos de interfaz: no representan el catálogo ni precios de EP 3D.
export const demoProducts: Product[] = [
  {
    id: 'demo-01',
    name: 'Pieza de ejemplo 01',
    description: 'Aquí irá la descripción de un producto real de EP 3D.',
    priceMinor: 1200,
    wholesalePriceMinor: null,
    availability: 'bajo_pedido',
    images: [],
  },
  {
    id: 'demo-02',
    name: 'Pieza de ejemplo 02',
    description: 'Un espacio para mostrar material, tamaño y detalles de la pieza.',
    priceMinor: 1800,
    wholesalePriceMinor: null,
    availability: 'bajo_pedido',
    images: [],
  },
  {
    id: 'demo-03',
    name: 'Pieza de ejemplo 03',
    description: 'Ejemplo del estado agotado: no se puede agregar al carrito.',
    priceMinor: 2400,
    wholesalePriceMinor: null,
    availability: 'agotado',
    images: [],
  },
];
