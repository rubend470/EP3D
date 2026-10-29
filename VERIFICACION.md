# Verificación del arranque local

Ejecutado en la Mac, dentro de este proyecto. No equivale a pruebas en un executor cloud independiente. La primera publicación en Firebase real también se verificó según se detalla abajo.

## Comprobado

- `npm run build`: TypeScript y build de producción correctos. Vite avisa de un chunk de Firestore mayor de 500 kB sin comprimir; está separado y se carga solo al usar Firebase. Es una optimización futura, no un fallo de compilación.
- `npm test`: **9 pruebas** de cantidades, recuperación de carrito, duplicados, total, mensaje, cambios de precio, disponibilidad, precio al mayor opcional y totales siempre al detal.
- `npm run test:rules`: **8 pruebas** correctas contra emuladores Firestore y Storage, proyecto ficticio `demo-ep3d`, sin credenciales ni acceso a producción. Se verificaron lectura pública del catálogo, denegación de escrituras sin rol, rechazo de autoasignación, CRUD válido de admin, validación de datos/fotos, y restricciones de subida/borrado de imágenes. Los mensajes PERMISSION_DENIED son esperados en pruebas de denegación.
- Servidor local responde HTTP correctamente. Navegador: catálogo demo, agregar producto, editar a 3 unidades, total de 36 unidades demo, borrador del mensaje, WhatsApp desactivado, persistencia tras recargar y eliminar del carrito.
- Revisión visual en anchos móviles de 390 y 320 px y viewport de escritorio. Barra inferior fija, cantidad/total actualizados al agregar, enlace al carrito y sin desbordamiento horizontal en ambos anchos. El acceso directo a WhatsApp verifica precios antes de navegar; la apertura real no se probó porque faltan número y moneda. Los recursos de ejemplo están hechos en CSS; no son fotos de productos reales ni logo definitivo.
- `.gitignore` excluye `.env.local`, dependencias, build y logs. Repositorio Git local inicializado en `main`; remoto indicado por Rubén: `https://github.com/rubend470/EP3D.git`. Sin ramas ni etiquetas remotas al inspeccionarlo antes de la primera subida. Escaneo local de archivos fuente/configuración sin coincidencias de claves privadas, tokens GitHub/Google ni cuentas de servicio. Solo existe `.env.example`, sin valores de conexión.

## Pendiente

- Inicialización de Authentication y proveedor correo/contraseña, asignación de custom claim por operador autorizado y sesión con administrador real.
- CRUD y optimización/subida de fotos de extremo a extremo con Firebase de pruebas. Las reglas se probaron con emuladores; el formulario no ha operado una cuenta real.
- Dispositivos físicos y más navegadores; no se afirma auditoría exhaustiva de accesibilidad.
- Catálogo, fotos, logo, moneda y WhatsApp reales.
- Entorno de ejecución cloud independiente y primera instalación allí. La sincronización de Git se verifica comparando HEAD local y `refs/heads/main` remoto después de cada push.
- Decisión informada sobre Blaze para Storage. No se activó facturación ni Storage y no se crearon credenciales persistentes nuevas.

## Primera publicación real en Firebase

- Proyecto verificado: `ep3d-1fb00` (EP3D); app web existente. Sitio asociado `ep3dcatalago`, sin releases previos al primer despliegue.
- Firestore API habilitada y primera base `(default)` creada en `us-east1`, edición Standard. La respuesta confirma `freeTier: true`; PITR desactivado. No existían bases que preservar.
- Build de producción en modo `firebase`, USD, sin teléfono inventado y Storage desactivado. No se cargaron los datos demo a la base real.
- Despliegue autorizado limitado a Hosting, reglas e índices de Firestore. No se desplegó Storage ni Functions.
- Lectura anónima real de `/products`: HTTP 200, cero productos. Navegador móvil: carga desde Firestore sin error y estado de catálogo vacío, USD 0,00, carrito vacío y WhatsApp desactivado por falta del número real.
- Ruta `/#admin`: muestra formulario privado sin registro público. Authentication todavía devuelve `CONFIGURATION_NOT_FOUND` al consultar su configuración; falta inicializarlo desde la consola. No se probó inicio de sesión ni CRUD real.
- URL: https://ep3dcatalago.web.app . Las capturas locales anteriores muestran el modo demo; `evidence/firebase-catalogo-movil.jpg` corresponde a la primera versión real.
