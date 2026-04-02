# MXWatch (Backend API)

## Descripción

Este proyecto funciona como la API central de datos para la plataforma MXWatch. Su principal responsabilidad es consultar, gestionar y proveer toda la información estadística y geográfica que de forma simultánea consume y muestra al público el mapa interactivo.

## Características

- **Inventario Relacional**: Estructura de base de datos eficiente que entrelaza áreas geográficas, organizaciones y actividad específica.
- **Consultas Veloces**: Diseño optimizado en tiempos de respuesta para asegurar que la visualización del mapa nunca se trabe.
- **Información Cruzada**: Sistema inteligente que filtra y devuelve datos vinculados de manera correcta evitando la duplicación de reportes.
- **Tipado Seguro**: Diseño estricto de reglas compartidas automáticamente con la plataforma visual.

## Secciones

1. **Catálogos Maestros**: Espacios para registrar y administrar la información inamovible (Ej. listas de estados u organizaciones existentes).
2. **Registro Geográfico Central**: Tabla que funge como eje principal conectando una geolocalización o estado con las actividades reportadas en la misma.
3. **Tablas Dinámicas**: Apartado para adjuntar de forma aislada información sensible adicional (líderes, grupos o incidencias).

## Uso

- **Integración Nativa**: Este proyecto entrega toda su carga en formato JSON para que el frontend pueda estructurar gráficos inmediatamente.
- **Endpoints Flexibles**: Cuenta con rutas ligeras utilizadas al cargar el sitio principal y rutas profundas que se activan solo al solicitar datos extensos de un estado.

## Tecnologías Utilizadas

- Node.js / Bun
- Hono
- PostgreSQL
- Drizzle ORM
- Biome

## Instalación

1. **Clonar el Repositorio**: Descarga este repositorio en tu computadora usando Git.

```bash
git clone https://github.com/Ivandv19/mxwatch-api.git
```

2. **Instalar Dependencias**: Entra a la carpeta del proyecto desde la terminal y ejecuta:

```bash
bun install
```

3. **Variables de Entorno**: Crea un archivo `.dev.vars` (que es el equivalente a `.env` en infraestructuras Cloudflare). Deberás colocar `DATABASE_URL` vinculándolo a la raíz de tu base de datos PostgreSQL.

4. **Iniciar el Servidor**: Enciende la API en tu entorno local usando el comando:

```bash
bun run dev
```

## Créditos

Este es el proyecto backend encargado del esquema y control operativo del mapa gráfico.

- Desarrollado por Ivan Cruz.

## Despliegue

## Despliegue

Este motor de datos se encuentra desplegado y administrado permanentemente a través de **Dokploy** en un servidor VPS. Puedes consultar la documentación interactiva de la API (Swagger) en: [http://mxwatch-api.fluxdv.icu/api/docs](http://mxwatch-api.fluxdv.icu/api/docs) o en tu entorno local en `http://localhost:3001/api/docs`.

## Licencia

Licencia de Uso Personal:

Este software es propiedad de **Ivan Cruz**. Se permite el uso de este software solo para fines personales y no comerciales. No se permite la distribución, modificación ni uso comercial de este software sin el consentimiento expreso de **Ivan Cruz**.

Cualquier uso no autorizado puede resultar en acciones legales.
