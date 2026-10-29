# Verificación del arranque local

Ejecutado en la Mac, dentro de este proyecto. No equivale a pruebas en un executor cloud independiente ni en un proyecto Firebase real.

## Comprobado

- `npm run build`: TypeScript y build de producción correctos. Vite avisa de un chunk de Firestore mayor de 500 kB sin comprimir; está separado y se carga solo al usar Firebase. Es una optimización futura, no un fallo de compilación.
- `npm test`: **9 pruebas** de cantidades, recuperación de carrito, duplicados, total, mensaje, cambios de precio, disponibilidad, precio al mayor opcional y totales siempre al detal.
- `npm run test:rules`: **8 pruebas** correctas contra emuladores Firestore y Storage, proyecto ficticio `demo-ep3d`, sin credenciales ni acceso a producción. Se verificaron lectura pública del catálogo, denegación de escrituras sin rol, rechazo de autoasignación, CRUD válido de admin, validación de datos/fotos, y restricciones de subida/borrado de imágenes. Los mensajes PERMISSION_DENIED son esperados en pruebas de denegación.
- Servidor local responde HTTP correctamente. Navegador: catálogo demo, agregar producto, editar a 3 unidades, total de 36 unidades demo, borrador del mensaje, WhatsApp desactivado, persistencia tras recargar y eliminar del carrito.
- Revisión visual en anchos móviles de 390 y 320 px y viewport de escritorio. Barra inferior fija, cantidad/total actualizados al agregar, enlace al carrito y sin desbordamiento horizontal en ambos anchos. El acceso directo a WhatsApp verifica precios antes de navegar; la apertura real no se probó porque faltan número y moneda. Los recursos de ejemplo están hechos en CSS; no son fotos de productos reales ni logo definitivo.
- `.gitignore` excluye `.env.local`, dependencias, build y logs. Repositorio Git local inicializado en `main`; remoto indicado por Rubén: `https://github.com/rubend470/EP3D.git`. Sin ramas ni etiquetas remotas al inspeccionarlo antes de la primera subida. Escaneo local de archivos fuente/configuración sin coincidencias de claves privadas, tokens GitHub/Google ni cuentas de servicio. Solo existe `.env.example`, sin valores de conexión.

## Pendiente

- Auth real, asignación de custom claim por operador autorizado y sesión con administrador real.
- CRUD y optimización/subida de fotos de extremo a extremo con Firebase de pruebas. Las reglas se probaron con emuladores; el formulario no ha operado una cuenta real.
- Dispositivos físicos y más navegadores; no se afirma auditoría exhaustiva de accesibilidad.
- Catálogo, fotos, logo, moneda y WhatsApp reales.
- Entorno de ejecución cloud independiente y primera instalación allí. La sincronización de Git debe comprobarse comparando HEAD local y `refs/heads/main` remoto.
- Configuración y publicación en Firebase, decisión informada sobre Blaze para Storage. Sin despliegue, facturación ni credenciales persistentes creadas.
