# EP 3D — catálogo y administración

Proyecto independiente. React + TypeScript + Vite; Firebase Hosting para el frontend estático, Firestore para productos, Authentication para administradores y Cloud Storage para fotos. React permite usar Hosting sin un servidor adicional; Laravel requeriría un runtime externo. Primera versión publicada, con autorización de Rubén, en [ep3dcatalago.web.app](https://ep3dcatalago.web.app). Se usa exclusivamente el proyecto Firebase `ep3d-1fb00`; no se activó facturación ni Cloud Storage.

## Estado actual

- Hosting: `ep3dcatalago`, con catálogo mobile-first y barra fija de WhatsApp.
- Firestore: base `(default)`, edición Standard, región `us-east1`, nivel gratuito confirmado por la API; reglas e índices desplegados. Catálogo real vacío, sin productos ni precios inventados.
- Moneda: **USD**, confirmada por Rubén. WhatsApp real pendiente, por lo que el botón sigue desactivado.
- Authentication: la ruta del panel funciona; falta inicializar Authentication desde la consola de Firebase, habilitar correo/contraseña y autorizar la cuenta administradora. No se crearon cuentas ni contraseñas.
- Fotos: `VITE_STORAGE_ENABLED=false`; productos sin fotos están soportados. Configurar Storage/Blaze con el propietario en una fase posterior.
- GitHub: remoto `rubend470/EP3D`; cuenta del propietario autorizada para Git, rama `main`. Un repositorio remoto no reemplaza un executor cloud independiente.

## Arrancar

Requiere Node 22.14+ y npm. Instala dependencias únicamente del registro oficial:

```sh
npm ci --registry=https://registry.npmjs.org
cp .env.example .env.local
npm run dev
```

Abre la URL local que imprima Vite. `/#admin` abre el panel. Sin configuración se usa **demo**, con tres ejemplos y unidades ficticias claramente rotuladas. Demo no importa el cliente Firebase ni guarda productos en la nube. No representa el catálogo de EP 3D y no abre WhatsApp. El carrito demo tiene su propio espacio local.

```sh
npm run build
npm test
npm run test:rules
```

`build` verifica tipos y genera `dist/`. `test` verifica dominio, cantidades, precios al mayor, persistencia corrupta, cambio de precios y generación del mensaje. `test:rules` requiere Java 21 y descarga los emuladores oficiales si no están disponibles. Ejecuta **solo** Firestore y Storage contra `demo-ep3d`; no necesita iniciar sesión ni credenciales. Las pruebas normales excluyen reglas cuando no hay emuladores. Consulta `VERIFICACION.md` para resultados reales de este arranque.

## Estructura

```text
src/
  config.ts                  configuración pública / moneda
  domain/catalog.ts          tipos, validación, cantidades, mayor, totales y mensaje
  data/firebase.ts           inicialización de SDK Firebase (solo modo real)
  data/products.ts           peticiones de catálogo y CRUD de Firestore
  data/demo.ts               ejemplos aislados de datos reales
  services/adminAuth.ts      sesión y verificación del rol administrador
  services/images.ts         optimización local y subida a Cloud Storage
  features/catalog/          presentación de productos
  features/admin/            interfaz privada de gestión
  features/cart/             barra fija de carrito y acceso a WhatsApp
  App.tsx                    composición y flujo de catálogo/carrito
  styles.css                 estilos responsive, sin fuentes ni imágenes externas
firestore.rules              validación y autorización de productos
storage.rules                autorización, ruta, tipo y tamaño de fotos
firebase.json                configuración local de Hosting y emuladores
```

Las pantallas usan la capa de datos y servicios: no contienen consultas Firestore ni llamadas al SDK de autenticación. El dominio no depende de React ni Firebase. El siguiente crecimiento natural es extraer el estado de carrito a un hook, añadir paginación si aumenta el catálogo y dividir estilos por componente. No se agregó infraestructura de pedidos, inventario numérico, compradores ni pagos.

## Modelo de producto

Colección `products`, documento con identificador estable (UUID al crear). Todos los campos son obligatorios; el precio al mayor puede ser `null`:

```ts
{
  name: string,               // 1–120 caracteres
  description: string,        // hasta 1000 caracteres
  priceMinor: number,         // entero, precio al detal en centavos
  wholesalePriceMinor: number | null, // entero >=0, no mayor al normal
  availability: 'bajo_pedido' | 'agotado',
  images: string[]            // hasta 6 URLs HTTPS de fotos públicas
}
```

No se escribe `id` dentro del documento; se obtiene de su ruta. No usar precios de coma flotante en Firestore. La base contempla monedas con **dos decimales**; confirmar moneda antes de ingresar precios reales. Para otra precisión habría que parametrizar el factor de unidades menores primero.

Precio al mayor: es un campo opcional e independiente, publicado aparte del precio al detal. Se guarda como `null` cuando no está definido y se oculta en ese producto. No hay cantidad mínima ni cambio automático de tarifa; el carrito y el mensaje usan el precio al detal. Los acuerdos al mayor se resuelven por WhatsApp.

## Catálogo y carrito

- Bajo pedido permite agregar; agotado bloquea agregar. Cantidades enteras 1–9999. Editar y quitar artículos; persistencia en `localStorage` con separación por demo/proyecto/moneda.
- Una consulta al cargar catálogo (React Strict Mode puede duplicarla en desarrollo); sin listeners continuos ni sondeos. Las fotos usan carga diferida y dimensiones reservadas.
- Al revisar selección, se consultan precios/condiciones actuales desde el servidor, se actualizan productos y se retiran agotados o eliminados. Si cambia el precio al detal, se pide revisar otra vez. Un fallo de conexión impide preparar el mensaje.
- El mensaje incluye únicamente nombre del producto, cantidad, precio unitario aplicado y total del pedido; sin códigos, opciones ni campos extra. Se revisa antes de abrir WhatsApp. La revisión vence tras 60 segundos; se exige volver a comprobar. La disponibilidad final puede cambiar después: la tienda confirma por chat.
- Barra fija inferior en el catálogo, también en móviles, con enlace al carrito, cantidad, total y botón para abrir WhatsApp directamente tras verificar precios. Respeta el área segura del teléfono y reserva espacio para no tapar contenido. Si cambia un precio o falla la verificación, muestra el aviso en el carrito antes de continuar.
- `VITE_WHATSAPP_NUMBER` vacío o inválido mantiene desactivado WhatsApp. Usar el número real internacional sin `+` ni espacios. El comprador envía manualmente. No hay pedidos, pagos ni confirmación automáticos.
- Entrega y pago por chat; personalizaciones fuera del carrito, por otro chat. No se inventó otro contacto ni enlace.

## Panel y fotos

El modo Firebase permite iniciar sesión con correo/contraseña de un administrador ya creado, listar/crear/editar/eliminar productos, manejar precios y disponibilidad, subir hasta seis fotos y retirar referencias a fotos. No hay formulario de registro ni autoasignación de permisos.

Las imágenes JPG/PNG/WebP se redimensionan a máximo 1600 px, convierten a WebP con calidad 0.8 y deben quedar en hasta 2 MB. Se limita origen a 15 MB y 40 megapíxeles. Las rutas llevan UUID y caché inmutable. Retirar una referencia no borra físicamente la foto; evita eliminar archivos aún usados. Una subida sin guardar puede dejar un archivo huérfano. Antes de crecer, planificar limpieza administrativa de huérfanos; nunca desde permisos públicos.

Las fotos son **públicas** por diseño. Las URLs de descarga también permiten compartirlas. Nunca subir documentos privados. Las reglas validan metadatos y tamaño; no inspeccionan el contenido binario. El procesado normal de la interfaz re-encodea el archivo, pero no reemplaza una auditoría de contenido si se incorporan otros cargadores en el futuro.

## Conectar Firebase después, con Rubén

1. Confirmar moneda, WhatsApp real, logo/estilo, productos/fotos. El proyecto existente es **`ep3d-1fb00`**, ya conectado; no crear otro. Firestore ya está en `us-east1`; revisar región y costos específicos de Storage cuando se habilite.
2. Registrar una app web y copiar su **configuración pública** a `.env.local` siguiendo `.env.example`; cambiar `VITE_DATA_MODE=firebase`. No subir `.env.local` a Git. Para habilitar las fotos después de configurar y probar Storage con el propietario, cambiar `VITE_STORAGE_ENABLED=true`. Las variables `VITE_*` quedan incluidas en el frontend: jamás poner cuentas de servicio, claves privadas, contraseñas o tokens Admin ahí. La configuración web no concede permisos de administrador.
3. Habilitar Firestore y Authentication con correo/contraseña. Crear la cuenta administradora de forma controlada. Un operador autorizado asigna el custom claim `admin: true` **desde un entorno confiable con Admin SDK**; esta app no puede asignarlo ni almacenar roles editables. Volver a iniciar sesión para refrescar el token. Evitar contraseñas en chat; el propietario realiza el acceso local.
4. Cloud Storage requiere **Blaze / cuenta de facturación**. Elegir Firebase no activa ni autoriza facturación en este arranque. Revisar cuotas, región, precios vigentes y configurar alertas antes de habilitarlo. Las alertas no son un límite de gasto; US$0 no está garantizado. No se fijó una región ni se prometieron costos.
5. Ejecutar pruebas de reglas con emuladores y después verificar el flujo con una cuenta administradora y una cuenta sin permisos en un entorno de pruebas. Las reglas locales permiten leer solo productos/fotos del catálogo; solo `request.auth.token.admin == true` puede escribir. Las demás rutas se deniegan. Un usuario autenticado común no es administrador. Firebase Admin SDK omite reglas: mantener credenciales fuera del cliente y usar IAM mínimo.
6. Antes del primer despliegue revisar reglas, región, presupuesto, dominios autorizados, protección contra abuso (App Check), fotos y datos reales. La publicación es una fase posterior que se hará contigo, indicando el proyecto de destino explícitamente. No hay proyecto por defecto ni `.firebaserc`; indicar siempre `--project ep3d-1fb00`. `firebase.json` fija el sitio `ep3dcatalago`. `firebase.json` está preparado para servir `dist/` como SPA.

Documentación oficial consultada: [claims de administrador](https://firebase.google.com/docs/auth/admin/custom-claims), [pruebas locales de reglas](https://firebase.google.com/docs/rules/unit-tests), [requisito Blaze para Storage](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024).

## Datos pendientes

- Moneda confirmada: USD. Mercado: Venezuela.
- WhatsApp real de EP 3D y contacto separado para personalizaciones, si se quiere enlazar.
- Logo, colores, fotos, nombres, descripciones y precios reales.
- Precios al mayor opcionales para los productos que ya los tengan definidos.
- Cuenta administradora que autorizará el propietario. Proyecto y región de Firestore ya confirmados.
