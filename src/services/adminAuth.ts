// La UI consume este servicio; no importa SDKs ni hace peticiones directamente.
import type { User } from 'firebase/auth';
export async function observeAdmin(
  callback: (state: { user: User | null; admin: boolean }) => void,
  onError: () => void,
) {
  const [{ auth }, { onIdTokenChanged }] = await Promise.all([
    import('../data/firebase'),
    import('firebase/auth'),
  ]);
  return onIdTokenChanged(auth, async (user) => {
    callback({ user, admin: false });
    try {
      callback({ user, admin: !!user && (await user.getIdTokenResult()).claims.admin === true });
    } catch {
      onError();
    }
  });
}
export async function loginAdmin(email: string, password: string) {
  const [{ auth }, { signInWithEmailAndPassword }] = await Promise.all([
    import('../data/firebase'),
    import('firebase/auth'),
  ]);
  await signInWithEmailAndPassword(auth, email, password);
}
export async function logoutAdmin() {
  const [{ auth }, { signOut }] = await Promise.all([
    import('../data/firebase'),
    import('firebase/auth'),
  ]);
  await signOut(auth);
}
