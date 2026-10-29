// Re-encodea y reduce fotos en el navegador antes de subir. No acepta SVG.
export async function optimizeImage(file: File): Promise<Blob> {
  if (
    !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
    file.size > 15 * 1024 * 1024
  )
    throw new Error('Usa JPG, PNG o WebP de hasta 15 MB.');
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 40000000)
      throw new Error('La imagen supera 40 megapíxeles.');
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('No se pudo procesar la foto.');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('No se pudo convertir la foto.'))),
        'image/webp',
        0.8,
      ),
    );
    if (blob.size > 2 * 1024 * 1024 || blob.type !== 'image/webp')
      throw new Error('La foto optimizada debe ser WebP y pesar menos de 2 MB.');
    return blob;
  } finally {
    bitmap.close();
  }
}
export async function uploadImage(productId: string, file: File) {
  const blob = await optimizeImage(file);
  const [{ storage }, { ref, uploadBytes, getDownloadURL }] = await Promise.all([
    import('../data/storage'),
    import('firebase/storage'),
  ]);
  const target = ref(storage, `products/${productId}/${crypto.randomUUID()}.webp`);
  await uploadBytes(target, blob, {
    contentType: 'image/webp',
    cacheControl: 'public,max-age=31536000,immutable',
  });
  return getDownloadURL(target);
}
