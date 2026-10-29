import { useState } from 'react';
import { isDemo, money } from '../../config';
import { MAX_QUANTITY, validQuantity, type Product } from '../../domain/catalog';

export default function ProductCard({
  product: p,
  index,
  add,
}: {
  product: Product;
  index: number;
  add: (p: Product, q: number) => void;
}) {
  const [quantity, setQuantity] = useState('1');
  const [imageIndex, setImageIndex] = useState(0);
  return (
    <article className="product">
      <div className={`product-image tone-${index % 3}`}>
        {p.images.length ? (
          <img
            loading="lazy"
            decoding="async"
            src={p.images[imageIndex] || p.images[0]}
            alt={p.name}
            onError={(e) => {
              e.currentTarget.alt = 'No se pudo cargar la foto';
            }}
          />
        ) : (
          <div className="placeholder">
            <div className={`object object-${index % 3}`} />
            <span>{isDemo ? 'IMAGEN DE EJEMPLO' : 'FOTO PENDIENTE'}</span>
          </div>
        )}
        <span className={`badge ${p.availability === 'agotado' ? 'sold' : ''}`}>
          {p.availability === 'agotado' ? 'Agotado' : 'Bajo pedido'}
        </span>
      </div>
      {p.images.length > 1 && (
        <div className="photo-controls">
          {p.images.map((_, i) => (
            <button
              aria-label={`Foto ${i + 1} de ${p.name}`}
              aria-pressed={i === imageIndex}
              key={i}
              onClick={() => setImageIndex(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
      <div className="product-info">
        <small>EP 3D / {p.id}</small>
        <h3>{p.name}</h3>
        <p>{p.description}</p>
        <strong className="price">Al detal: {money(p.priceMinor)}</strong>
        {p.wholesalePriceMinor !== null && (
          <small className="wholesale">Al mayor: {money(p.wholesalePriceMinor)}</small>
        )}
        <div className="add-row">
          <label className="sr-only" htmlFor={`qty-${p.id}`}>
            Cantidad de {p.name}
          </label>
          <input
            id={`qty-${p.id}`}
            type="number"
            min="1"
            max={MAX_QUANTITY}
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            disabled={p.availability === 'agotado'}
          />
          <button
            disabled={p.availability === 'agotado' || !validQuantity(Number(quantity))}
            onClick={() => add(p, Number(quantity))}
          >
            {p.availability === 'agotado' ? 'No disponible' : 'Agregar'} <span>＋</span>
          </button>
        </div>
      </div>
    </article>
  );
}
