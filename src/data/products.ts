import { isDemo } from '../config';
import { demoProducts } from './demo';
import { validProduct, type Product } from '../domain/catalog';
export async function loadProducts(): Promise<Product[]> {
  if (isDemo) return structuredClone(demoProducts);
  const [{ db }, { collection, getDocsFromServer }] = await Promise.all([
    import('./firebase'),
    import('firebase/firestore'),
  ]);
  // Una lectura inicial, sin listener continuo; nueva lectura al revisar el carrito.
  const snapshot = await getDocsFromServer(collection(db, 'products'));
  return snapshot.docs.map((d) => {
    const p = { ...d.data(), id: d.id };
    if (!validProduct(p)) throw new Error(`Producto inválido: ${d.id}. Contacta al administrador.`);
    return p;
  });
}
export async function saveProduct(p: Product) {
  if (isDemo) throw new Error('El demo no escribe en Firebase.');
  if (!validProduct(p)) throw new Error('Revisa los datos del producto.');
  const [{ db }, { doc, setDoc }] = await Promise.all([
    import('./firebase'),
    import('firebase/firestore'),
  ]);
  const { id, ...data } = p;
  await setDoc(doc(db, 'products', id), data);
}
export async function removeProduct(id: string) {
  const [{ db }, { doc, deleteDoc }] = await Promise.all([
    import('./firebase'),
    import('firebase/firestore'),
  ]);
  await deleteDoc(doc(db, 'products', id));
}
