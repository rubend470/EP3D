import { readFileSync } from 'node:fs';
import { beforeAll, afterAll, describe, it } from 'vitest';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getBytes, deleteObject } from 'firebase/storage';
let env: RulesTestEnvironment;
const data = {
  name: 'Pieza',
  description: 'Prueba local',
  priceMinor: 1250,
  wholesalePriceMinor: null,
  availability: 'bajo_pedido',
  images: [],
};
beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-ep3d',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
    storage: { rules: readFileSync('storage.rules', 'utf8'), host: '127.0.0.1', port: 9199 },
  });
}, 30000);
afterAll(async () => {
  await env?.cleanup();
});
describe('Reglas Firestore', () => {
  it('permite leer catálogo sin sesión', async () => {
    await assertSucceeds(
      getDoc(doc(env.unauthenticatedContext().firestore(), 'products', 'public')),
    );
  });
  it('deniega escrituras anónimas y de usuarios comunes', async () => {
    for (const ctx of [env.unauthenticatedContext(), env.authenticatedContext('buyer')])
      await assertFails(setDoc(doc(ctx.firestore(), 'products', 'blocked'), data));
  });
  it('deniega autoasignación de administrador', async () => {
    await assertFails(
      setDoc(doc(env.authenticatedContext('buyer').firestore(), 'admins', 'buyer'), {
        admin: true,
      }),
    );
    await assertFails(
      setDoc(doc(env.authenticatedContext('buyer').firestore(), 'users', 'buyer'), { admin: true }),
    );
  });
  it('admin puede crear, actualizar y eliminar producto válido', async () => {
    const d = doc(
      env.authenticatedContext('admin', { admin: true }).firestore(),
      'products',
      'allowed',
    );
    await assertSucceeds(setDoc(d, data));
    await assertSucceeds(setDoc(d, { ...data, priceMinor: 1700, wholesalePriceMinor: 1000 }));
    await assertSucceeds(deleteDoc(d));
  });
  it('rechaza precios inválidos, estados extra, campos inesperados y fotos inseguras', async () => {
    const d = doc(
      env.authenticatedContext('admin', { admin: true }).firestore(),
      'products',
      'invalid',
    );
    for (const change of [
      { wholesalePriceMinor: 2000 },
      { wholesaleMinQuantity: 5 },
      { priceMinor: -1 },
      { priceMinor: 1.2 },
      { availability: 'disponible' },
      { role: 'admin' },
      { images: ['javascript:alert(1)'] },
      { images: Array(7).fill('https://example.test/a') },
    ])
      await assertFails(setDoc(d, { ...data, ...change }));
  });
});
describe('Reglas Storage', () => {
  it('deniega subir fotos sin rol admin', async () => {
    for (const ctx of [env.unauthenticatedContext(), env.authenticatedContext('buyer')])
      await assertFails(
        uploadBytes(ref(ctx.storage(), 'products/test/blocked.webp'), new Uint8Array([1]), {
          contentType: 'image/webp',
        }),
      );
  });
  it('admin sube foto pública y puede eliminarla', async () => {
    const path = 'products/test/public.webp';
    await assertSucceeds(
      uploadBytes(
        ref(env.authenticatedContext('admin', { admin: true }).storage(), path),
        new Uint8Array([1]),
        { contentType: 'image/webp' },
      ),
    );
    await assertSucceeds(getBytes(ref(env.unauthenticatedContext().storage(), path)));
    await assertFails(deleteObject(ref(env.authenticatedContext('buyer').storage(), path)));
    await assertSucceeds(
      deleteObject(ref(env.authenticatedContext('admin', { admin: true }).storage(), path)),
    );
  });
  it('deniega tipos, tamaños y rutas indebidas aun a administradores', async () => {
    const s = env.authenticatedContext('admin', { admin: true }).storage();
    await assertFails(
      uploadBytes(ref(s, 'products/test/bad.webp'), new Uint8Array([1]), {
        contentType: 'image/svg+xml',
      }),
    );
    await assertFails(
      uploadBytes(ref(s, 'products/test/big.webp'), new Uint8Array(2 * 1024 * 1024 + 1), {
        contentType: 'image/webp',
      }),
    );
    await assertFails(
      uploadBytes(ref(s, 'private/file.webp'), new Uint8Array([1]), { contentType: 'image/webp' }),
    );
  });
});
