# Continuar en nube sin depender de la Mac

Esta conversación puede ejecutarse en nube, pero **el executor y estos archivos están en la Mac**. Apagarla interrumpe este entorno. Un repositorio guarda el código; por sí solo no ejecuta agentes, builds ni despliegues. Actualmente no hay un executor cloud independiente configurado.

## Listo para el repositorio de Rubén

El mismo proyecto está en `ep-3d/`; no se debe crear otra implementación. Rubén indicó el repositorio [rubend470/EP3D](https://github.com/rubend470/EP3D). Esta carpeta corresponde a la raíz del repositorio y la rama inicial es `main`. Se comprobó que el repositorio remoto estaba vacío antes de preparar la primera subida. Conservar el lockfile para instalaciones reproducibles. No se crearon cuentas ni credenciales nuevas.

Antes de subir, comprobar que `git status` no incluya `.env.local`, credenciales, caches, `node_modules/`, `dist/` ni logs; están excluidos. La configuración pública de ejemplo sí se conserva. Guardar secretos exclusivamente en el almacén seguro del entorno elegido; no en el repositorio ni en mensajes del chat.

## Requisitos de cualquier executor cloud

- Checkout de ese mismo repositorio y rama.
- Node.js 22 (mínimo 22.14) y npm; Java 21 solo para pruebas de emuladores.
- Acceso a `registry.npmjs.org` y a descargas oficiales de emuladores Firebase.
- Espacio para dependencias y caché de emuladores. Ninguna credencial para modo demo/build/pruebas.
- Puerto 5173 para vista previa, manteniendo el acceso privado. Los emuladores escuchan en loopback y no deben publicarse.

```sh
npm ci --registry=https://registry.npmjs.org
cp .env.example .env.local
npm run build
npm test
npm run test:rules
npm run dev
```

En una plataforma que necesite escuchar en todas las interfaces para reenviar la vista previa, ejecutar `npm run dev -- --host 0.0.0.0` solo dentro de ese entorno y conservar el reenvío privado. El modo predeterminado en la Mac usa `127.0.0.1`.

## Pendiente para ejecución en nube

1. Conectar el repositorio al entorno de código en nube que elija Rubén. Comprobar disponibilidad, límites, costos y si requiere mantener la Mac encendida; debe tener su propio executor para cumplir este objetivo.
2. Verificar instalación limpia, compilación y pruebas en ese executor. No afirmar que se probó en nube hasta hacerlo allí.
3. Configurar Firebase con el propietario siguiendo README.md. No copiar una cuenta de servicio al frontend. Definir el acceso de despliegue con permisos mínimos y el proyecto explícito, sin generar credenciales persistentes durante este arranque.
4. Publicar solo cuando Rubén continúe esa fase. Un futuro proceso CI puede compilar y probar cada cambio, y publicar versiones bajo una política de aprobación acordada. No se configuró despliegue automático ahora.

No es necesario duplicar el código para desarrollo local y nube: ambos usan el mismo repositorio, lockfile, comandos y esquema de datos.
