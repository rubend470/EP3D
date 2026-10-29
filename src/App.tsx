import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { currency, isDemo, money, phone, validCurrency, validPhone } from './config';
import CheckoutBar from './features/cart/CheckoutBar';
import ProductCard from './features/catalog/ProductCard';
import {
  MAX_QUANTITY,
  orderMessage,
  reconcile,
  restoreCart,
  total,
  validQuantity,
  type CartLine,
  type Product,
} from './domain/catalog';
import { loadProducts } from './data/products';
const Admin = lazy(() => import('./features/admin/Admin'));
const storageKey = `ep3d:cart:v1:${isDemo ? 'demo' : import.meta.env.VITE_FIREBASE_PROJECT_ID}:${currency}`;
function initialCart() {
  try {
    return restoreCart(localStorage.getItem(storageKey));
  } catch {
    return [];
  }
}
export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCartState] = useState<CartLine[]>(initialCart);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState(location.hash);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [preparedAt, setPreparedAt] = useState(0);
  const revision = useRef(0);
  function setCart(lines: CartLine[]) {
    revision.current++;
    setCartState(lines);
    setMessage('');
  }
  useEffect(() => {
    const fn = () => setView(location.hash);
    window.addEventListener('hashchange', fn);
    return () => window.removeEventListener('hashchange', fn);
  }, []);
  async function refresh() {
    setLoading(true);
    setError('');
    try {
      setProducts(await loadProducts());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el catálogo.');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(cart));
    } catch {
      setNotice(
        'El navegador no permite guardar el carrito. Se conservará solo mientras esta página esté abierta.',
      );
    }
  }, [cart]);
  function add(product: Product, quantity: number) {
    if (!validQuantity(quantity) || product.availability === 'agotado') return;
    const existing = cart.find((l) => l.product.id === product.id);
    if (existing && existing.quantity + quantity > MAX_QUANTITY) {
      setNotice('El máximo es 9999 unidades por pieza.');
      return;
    }
    setCart(
      existing
        ? cart.map((l) =>
            l.product.id === product.id ? { ...l, quantity: l.quantity + quantity } : l,
          )
        : [...cart, { product, quantity }],
    );
    setNotice(`${product.name}: agregado al carrito.`);
  }
  async function prepare(destination: 'preview' | 'whatsapp' = 'preview') {
    if (!cart.length || busy) return;
    if (destination === 'whatsapp' && (isDemo || !validPhone || !validCurrency)) return;
    const expectedRevision = revision.current;
    setBusy(true);
    setNotice('');
    setMessage('');
    try {
      const latest = await loadProducts();
      setProducts(latest);
      if (revision.current !== expectedRevision) {
        setNotice('Tu selección cambió durante la revisión. Revísala otra vez.');
        if (destination === 'whatsapp') location.hash = 'carrito';
        return;
      }
      const result = reconcile(cart, latest);
      setCart(result.lines);
      if (result.changes.length) {
        setNotice(result.changes.join(' '));
        if (destination === 'whatsapp') location.hash = 'carrito';
        return;
      }
      if (!result.lines.length) return;
      const text = orderMessage(result.lines, money);
      setMessage(text);
      if (destination === 'whatsapp')
        window.location.assign(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`);
      setPreparedAt(Date.now());
    } catch {
      setNotice('No se pudieron verificar los precios actuales. Reintenta cuando tengas conexión.');
      if (destination === 'whatsapp') location.hash = 'carrito';
    } finally {
      setBusy(false);
    }
  }
  const count = cart.reduce((sum, l) => sum + l.quantity, 0);
  return (
    <>
      <div className="topline">
        {isDemo
          ? 'VISTA DEMO · Productos, imágenes y valores de ejemplo'
          : 'Hecho capa a capa · EP 3D'}
      </div>
      <header>
        <a className="brand" href="#catalogo" aria-label="EP 3D, inicio">
          <span className="brand-mark">EP</span>
          <span>
            EP 3D<small>IDEAS QUE TOMAN FORMA</small>
          </span>
        </a>
        <nav>
          <a href="#catalogo">Catálogo</a>
          <a className="bag" href="#carrito">
            Tu carrito <span>{count}</span>
          </a>
        </nav>
      </header>
      {view === '#admin' ? (
        <main>
          <Suspense fallback={<p>Cargando panel…</p>}>
            <Admin onSaved={refresh} />
          </Suspense>
        </main>
      ) : (
        <main>
          <section className="hero">
            <div>
              <p className="eyebrow">DEL DISEÑO A TUS MANOS</p>
              <h1>
                Una idea.
                <br />
                Muchas <em>formas.</em>
              </h1>
              <p className="intro">
                Explora nuestras piezas, arma tu selección y conversemos por WhatsApp para hacerla
                realidad.
              </p>
              <a className="button" href="#catalogo">
                Explorar piezas <span>↗</span>
              </a>
              <p className="hero-note">Bajo pedido · Atención directa · Impresión 3D</p>
            </div>
            <div className="sculpture" aria-hidden="true">
              <div className="rings">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <span>
                CAPA A CAPA,
                <br />
                ALGO DIFERENTE.
              </span>
              <b>03D / EP</b>
            </div>
          </section>
          <div className="steps">
            <span>
              <b>01</b> Elige tus piezas
            </span>
            <span>
              <b>02</b> Arma tu carrito
            </span>
            <span>
              <b>03</b> Confirma por WhatsApp
            </span>
          </div>
          <div className="shop-layout">
            <section id="catalogo" className="catalog">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">EXPLORA LA COLECCIÓN</p>
                  <h2>Elige tu próxima pieza</h2>
                </div>
                <span>
                  {products.length} piezas{isDemo ? ' demo' : ''}
                </span>
              </div>
              <label className="search">
                Buscar una pieza
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nombre o descripción…"
                />
              </label>
              {loading ? (
                <p role="status">Cargando piezas…</p>
              ) : error ? (
                <div role="alert" className="notice">
                  {error}
                  <button onClick={refresh}>Reintentar</button>
                </div>
              ) : (
                <div className="product-grid">
                  {products
                    .filter((p) =>
                      (p.name + ' ' + p.description)
                        .toLocaleLowerCase()
                        .includes(search.toLocaleLowerCase()),
                    )
                    .map((p, index) => (
                      <ProductCard key={p.id} product={p} index={index} add={add} />
                    ))}
                  {!products.filter((p) =>
                    (p.name + ' ' + p.description)
                      .toLocaleLowerCase()
                      .includes(search.toLocaleLowerCase()),
                  ).length && <p>No hay piezas para mostrar.</p>}
                </div>
              )}
            </section>
            <aside id="carrito" className="cart">
              <p className="eyebrow">TU SELECCIÓN</p>
              <h2>
                El carrito <span>({count})</span>
              </h2>
              <p className="muted">La conversación es el siguiente paso.</p>
              {!cart.length && (
                <div className="empty">
                  <span>＋</span>
                  <p>
                    Algo especial empieza
                    <br />
                    con tu primera pieza.
                  </p>
                </div>
              )}
              {cart.map((line) => (
                <div className="cart-line" key={line.product.id}>
                  <strong>{line.product.name}</strong>
                  <small>{money(line.product.priceMinor)} / unidad</small>
                  <div>
                    <label>
                      Cantidad
                      <input
                        aria-label={`Cantidad de ${line.product.name}`}
                        type="number"
                        min="1"
                        max={MAX_QUANTITY}
                        step="1"
                        value={line.quantity}
                        onChange={(e) => {
                          const quantity = Number(e.target.value);
                          if (validQuantity(quantity))
                            setCart(
                              cart.map((l) =>
                                l.product.id === line.product.id ? { ...l, quantity } : l,
                              ),
                            );
                        }}
                      />
                    </label>
                    <button
                      className="text-button"
                      onClick={() => setCart(cart.filter((l) => l.product.id !== line.product.id))}
                    >
                      Quitar
                    </button>
                    <b>{money(line.quantity * line.product.priceMinor)}</b>
                  </div>
                </div>
              ))}
              <div className="total">
                <span>Total de productos</span>
                <strong>{money(total(cart))}</strong>
              </div>
              <p className="muted small">
                Entrega y pago se acuerdan por chat. Las personalizaciones se consultan en otro
                chat.
              </p>
              <button
                className="button full"
                disabled={!cart.length || busy || loading || !!error}
                onClick={() => void prepare()}
              >
                {busy ? 'Verificando…' : 'Revisar selección'} <span>↗</span>
              </button>
              {notice && (
                <p role="status" className="notice">
                  {notice}
                </p>
              )}
              {message && (
                <div className="message">
                  <label>
                    Mensaje para revisar
                    <textarea readOnly value={message} rows={10} />
                  </label>
                  <button
                    className="button full whatsapp"
                    disabled={isDemo || !validPhone || !validCurrency}
                    onClick={() => {
                      if (Date.now() - preparedAt > 60000) {
                        setMessage('');
                        setNotice('Vuelve a revisar la selección para actualizar los precios.');
                        return;
                      }
                      window.open(
                        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
                        '_blank',
                        'noopener,noreferrer',
                      );
                    }}
                  >
                    Abrir WhatsApp ↗
                  </button>
                  <p className="small">
                    Tú envías el mensaje manualmente. Esto no confirma una venta.
                  </p>
                </div>
              )}
              {(isDemo || !validPhone || !validCurrency) && (
                <p className="small setup-note">
                  {isDemo
                    ? 'Demo: el envío está desactivado.'
                    : 'Pendiente configurar moneda y WhatsApp de la tienda.'}
                </p>
              )}
            </aside>
          </div>
          <section className="closing">
            <p className="eyebrow">TU IDEA, NUESTRA PRÓXIMA CAPA</p>
            <h2>
              Lo imaginamos.
              <br />
              Lo hacemos tangible.
            </h2>
            <p>
              ¿Buscas una personalización? Consúltala con EP 3D en un chat separado del catálogo.
            </p>
          </section>
        </main>
      )}
      {view !== '#admin' && (
        <CheckoutBar
          count={count}
          total={total(cart)}
          busy={busy}
          unavailable={loading || !!error}
          onWhatsApp={() => void prepare('whatsapp')}
        />
      )}
      <footer>
        <a className="brand" href="#catalogo">
          EP 3D
        </a>
        <span>Objetos que toman forma.</span>
        <a href="#admin">Administración</a>
      </footer>
    </>
  );
}
