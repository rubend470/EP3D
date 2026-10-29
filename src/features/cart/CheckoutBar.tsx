import { isDemo, money, validCurrency, validPhone } from '../../config';
export default function CheckoutBar({
  count,
  total,
  busy,
  unavailable,
  onWhatsApp,
}: {
  count: number;
  total: number;
  busy: boolean;
  unavailable: boolean;
  onWhatsApp: () => void;
}) {
  const configured = !isDemo && validPhone && validCurrency;
  return (
    <section className="checkout-dock" aria-label="Carrito y acceso a WhatsApp">
      <div className="checkout-inner">
        <a className="checkout-summary" href="#carrito" aria-live="polite">
          <span>
            Ver carrito · {count} {count === 1 ? 'unidad' : 'unidades'}
          </span>
          <strong>{money(total)}</strong>
        </a>
        <div className="checkout-action">
          <button
            className="button"
            disabled={!count || busy || unavailable || !configured}
            onClick={onWhatsApp}
          >
            {busy ? 'Verificando…' : 'Abrir WhatsApp'} <span aria-hidden="true">↗</span>
          </button>
          <small>
            {!configured
              ? isDemo
                ? 'Demo · WhatsApp desactivado'
                : 'Pendiente configurar WhatsApp y moneda'
              : 'Revisa tu carrito. Tú envías el mensaje en WhatsApp.'}
          </small>
        </div>
      </div>
    </section>
  );
}
