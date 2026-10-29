import { useEffect, useState, type FormEvent } from 'react';
import type { User } from 'firebase/auth';
import { isDemo, money, validCurrency } from '../../config';
import { loadProducts, removeProduct, saveProduct } from '../../data/products';
import type { Product } from '../../domain/catalog';
import { observeAdmin, loginAdmin, logoutAdmin } from '../../services/adminAuth';
import { uploadImage } from '../../services/images';
const empty = (): Product => ({
  id: crypto.randomUUID(),
  name: '',
  description: '',
  priceMinor: 0,
  wholesalePriceMinor: null,
  availability: 'bajo_pedido',
  images: [],
});
export default function Admin({ onSaved }: { onSaved: () => Promise<void> }) {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState(false);
  const [checking, setChecking] = useState(!isDemo);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [draft, setDraft] = useState<Product>(empty);
  const [price, setPrice] = useState('0.00');
  useEffect(() => {
    if (isDemo) return;
    let unsubscribe: (() => void) | undefined;
    let active = true;
    void observeAdmin(
      (state) => {
        if (!active) return;
        setUser(state.user);
        setAdmin(state.admin);
        setChecking(false);
        if (state.admin)
          void loadProducts()
            .then((p) => {
              if (active) setProducts(p);
            })
            .catch(() => setError('No se pudo cargar el catálogo.'));
      },
      () => {
        if (active) {
          setError('No se pudo verificar la autorización.');
          setChecking(false);
        }
      },
    )
      .then((fn) => {
        if (active) unsubscribe = fn;
        else fn();
      })
      .catch(() => {
        if (active) {
          setError('Firebase no está configurado. Revisa .env.local.');
          setChecking(false);
        }
      });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);
  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    try {
      await loginAdmin(String(data.get('email')), String(data.get('password')));
    } catch {
      setError('No se pudo iniciar sesión. Revisa tus datos o inténtalo más tarde.');
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    try {
      await logoutAdmin();
      setProducts([]);
      setDraft(empty());
    } catch {
      setError('No se pudo cerrar sesión. Reintenta.');
    }
  }
  function edit(p: Product) {
    setDraft(structuredClone(p));
    setPrice((p.priceMinor / 100).toFixed(2));
    setInfo('');
  }
  async function saved() {
    setProducts(await loadProducts());
    await onSaved();
    setDraft(empty());
    setPrice('0.00');
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setInfo('');
    try {
      if (!/^\d+(\.\d{1,2})?$/.test(price))
        throw new Error('Usa un precio positivo con hasta 2 decimales.');
      await saveProduct({ ...draft, priceMinor: Math.round(Number(price) * 100) });
      await saved();
      setInfo('Producto guardado.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar.');
    } finally {
      setBusy(false);
    }
  }
  async function photo(file: File) {
    setBusy(true);
    setError('');
    try {
      if (draft.images.length >= 6) throw new Error('Máximo 6 fotos por producto.');
      const url = await uploadImage(draft.id, file);
      setDraft((p) => ({ ...p, images: [...p.images, url] }));
      setInfo('Foto subida. Guarda el producto para asociarla.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir.');
    } finally {
      setBusy(false);
    }
  }
  if (isDemo)
    return (
      <section className="admin">
        <p className="eyebrow">PANEL PRIVADO</p>
        <h1>
          Tu catálogo,
          <br />
          en tus manos.
        </h1>
        <div className="notice">
          Modo demo: administración sin conexión. Para gestionar productos reales, configura
          Firebase y autoriza al administrador. Consulta README.md.
        </div>
        <a href="#catalogo">← Volver al catálogo</a>
      </section>
    );
  return (
    <section className="admin">
      <p className="eyebrow">ACCESO EP 3D</p>
      <h1>Administración</h1>
      {error && (
        <p className="notice" role="alert">
          {error}
        </p>
      )}
      {info && (
        <p className="notice" role="status">
          {info}
        </p>
      )}
      {checking ? (
        <p>Verificando permisos…</p>
      ) : !user ? (
        <form onSubmit={login}>
          <label>
            Correo
            <input name="email" type="email" autoComplete="username" required />
          </label>
          <label>
            Contraseña
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          <button className="button" disabled={busy}>
            Entrar
          </button>
          <p>Solo administradores previamente autorizados. No hay registro público.</p>
        </form>
      ) : (
        <>
          <button onClick={() => void logout()}>Cerrar sesión</button>
          {!admin ? (
            <p>Esta cuenta no tiene permisos de administración.</p>
          ) : (
            <div className="admin-grid">
              <div>
                <h2>Productos</h2>
                <button
                  disabled={busy}
                  onClick={() => {
                    setDraft(empty());
                    setPrice('0.00');
                  }}
                >
                  ＋ Nuevo producto
                </button>
                {products.map((p) => (
                  <button disabled={busy} className="admin-item" key={p.id} onClick={() => edit(p)}>
                    {p.name}
                    <small>
                      {money(p.priceMinor)} ·{' '}
                      {p.availability === 'agotado' ? 'Agotado' : 'Bajo pedido'}
                    </small>
                  </button>
                ))}
              </div>
              <form onSubmit={submit}>
                <fieldset disabled={busy}>
                  <legend>Editar pieza</legend>
                  <small>ID: {draft.id}</small>
                  <label>
                    Nombre
                    <input
                      required
                      maxLength={120}
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    />
                  </label>
                  <label>
                    Descripción
                    <textarea
                      required
                      maxLength={1000}
                      value={draft.description}
                      onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    />
                  </label>
                  <label>
                    Precio al detal (moneda configurada; 2 decimales)
                    <input
                      required
                      inputMode="decimal"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </label>
                  <label>
                    Precio al mayor (opcional)
                    <input
                      type="number"
                      min="0"
                      max="1000000"
                      step="0.01"
                      value={
                        draft.wholesalePriceMinor === null ? '' : draft.wholesalePriceMinor / 100
                      }
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          wholesalePriceMinor:
                            e.target.value === '' ? null : Math.round(Number(e.target.value) * 100),
                        })
                      }
                    />
                  </label>
                  <p className="small">
                    Déjalo vacío si este producto no tiene precio al mayor definido. Si lo
                    completas, se publica aparte del precio al detal. El carrito usa el precio al
                    detal.
                  </p>
                  <label>
                    Disponibilidad
                    <select
                      value={draft.availability}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          availability: e.target.value as Product['availability'],
                        })
                      }
                    >
                      <option value="bajo_pedido">Bajo pedido</option>
                      <option value="agotado">Agotado</option>
                    </select>
                  </label>
                  <label>
                    Fotos (máximo 6, WebP optimizado)
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={draft.images.length >= 6}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void photo(file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <div className="admin-photos">
                    {draft.images.map((url, i) => (
                      <div key={url}>
                        <img src={url} alt={`Foto ${i + 1}`} />
                        <button
                          type="button"
                          onClick={() =>
                            setDraft({ ...draft, images: draft.images.filter((_, n) => n !== i) })
                          }
                        >
                          Retirar foto {i + 1}
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="small">
                    Retirar una foto la desvincula del catálogo. La limpieza física de archivos se
                    realiza después, desde Storage, para evitar borrar fotos aún utilizadas.
                  </p>
                  <button className="button" disabled={!validCurrency}>
                    Guardar producto
                  </button>
                  {!validCurrency && <p>Configura la moneda real antes de guardar.</p>}
                  <button
                    type="button"
                    className="danger"
                    onClick={async () => {
                      if (!confirm(`¿Eliminar ${draft.name || 'este producto'} del catálogo?`))
                        return;
                      setBusy(true);
                      try {
                        await removeProduct(draft.id);
                        await saved();
                        setInfo('Producto eliminado.');
                      } catch {
                        setError('No se pudo eliminar el producto.');
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Eliminar producto
                  </button>
                </fieldset>
              </form>
            </div>
          )}
        </>
      )}
    </section>
  );
}
