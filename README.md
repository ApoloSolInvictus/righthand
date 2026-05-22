# RightHand

RightHand es una web app SaaS multi-tenant para pequenas empresas y PYMES de Costa Rica. Combina tienda en linea, CRM, pedidos, inventario basico, mensajeros independientes y un AI Delivery Manager que organiza entregas, genera rutas con Waze Deep Links y ayuda a vender mejor.

Slogan: **La mano derecha de tu tienda.**

## Arquitectura Corta

- **Frontend:** Next.js 14 App Router, TypeScript, Tailwind CSS y componentes estilo shadcn/ui.
- **Dominio multi-tenant:** todas las tablas operativas usan `business_id`; miembros y roles viven en `business_members`.
- **Datos:** Supabase Auth, Postgres, Storage y RLS. El MVP corre localmente con datos demo en `src/lib/mock-data.ts`.
- **AI Manager:** `POST /api/ai/delivery-manager` usa OpenAI Responses API con salida estructurada; si no hay `OPENAI_API_KEY` o hay timeout, responde con heuristica local.
- **AI Concierge:** `POST /api/ai/store-concierge` alimenta el chat global multilingue con negocios, tiendas, productos, horarios y zonas de entrega.
- **Traduccion global:** boton flotante de mundo con Google Translate para que visitantes extranjeros puedan leer tiendas, productos y checkout.
- **Ofertas:** promociones con texto e imagen para landing, tienda publica y chat IA, disponibles en todos los planes.
- **Marketing Digital:** `/dashboard/marketing` crea anuncios con GPT Image/OpenAI, referencias visuales, copy para redes y Canva Connect.
- **Pagos:** botones oficiales PayPal Live para suscripciones PYME/Pro y webhook para eventos.
- **Waze:** `generateWazeLink({ lat, lng, address })` usa lat/lng cuando existen y fallback por direccion para entregas y visitas a tienda.

## Paginas Incluidas

- `/`
- `/login`
- `/register`
- `/dashboard`
- `/dashboard/profile`
- `/dashboard/store`
- `/dashboard/offers`
- `/dashboard/marketing`
- `/dashboard/products`
- `/dashboard/orders`
- `/dashboard/customers`
- `/dashboard/accounting`
- `/dashboard/deliveries`
- `/dashboard/couriers`
- `/dashboard/ai-manager`
- `/dashboard/billing`
- `/courier`
- `/courier/orders`
- `/tienda/[slug]`
- `/tienda/[slug]/checkout`
- `/order/[publicTrackingCode]`
- `/api/health`
- `/api/ai/store-concierge`
- `/api/ai/marketing-image`
- `/api/canva/create-design`

## Instalacion Local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

Sin variables de entorno, login/register entran en modo demo y los endpoints de IA usan heuristica local. Supabase queda bloqueado aunque existan `NEXT_PUBLIC_SUPABASE_*` hasta activar `NEXT_PUBLIC_RIGHTHAND_SUPABASE_ENABLED=true`; esto evita mezclar datos con un proyecto Supabase equivocado.

Para conectar servicios reales:

```bash
cp .env.example .env.local
```

Luego completa Supabase, OpenAI, Canva y PayPal.

Para publicar y conectar APIs paso a paso, usa [docs/CONNECT_APIS.md](docs/CONNECT_APIS.md).

## Modo Demo Interactivo

Las pantallas de dashboard usan `localStorage` para que los botones funcionen sin backend real:

- Guardar identidad de tienda, logo y portada.
- Crear productos y ajustar stock.
- Publicar ofertas con texto e imagen para landing y tienda.
- Crear anuncios de marketing con imagenes de referencia, copy, hashtags y Canva.
- Crear pedidos desde checkout y verlos en seguimiento/dashboard local.
- Avanzar o cancelar pedidos.
- Agregar notas CRM.
- Revisar facturacion y auxiliar IVA CR imprimible/PDF.
- Invitar mensajeros y cambiar disponibilidad.
- Marcar entregas como recogidas/entregadas y adjuntar foto.
- Activar planes con PayPal en modo demo.

Para reiniciar la demo, borra las claves del navegador que empiezan con `righthand:`.

## Supabase

RightHand no trae APIs ni llaves reales en el repo. Las variables en `.env.example` son placeholders. En produccion Supabase solo se usa cuando el proyecto dedicado esta confirmado con:

```env
NEXT_PUBLIC_RIGHTHAND_SUPABASE_ENABLED=true
```

SQL principal:

```bash
supabase/migrations/0001_righthand_schema_fixed.sql
```

Seed demo:

```bash
supabase/seed.sql
```

El esquema crea:

- `profiles`
- `businesses`
- `business_members`
- `stores`
- `products`
- `product_categories`
- `customers`
- `orders`
- `order_items`
- `business_offers`
- `marketing_campaigns`
- `invoices`
- `delivery_zones`
- `couriers`
- `deliveries`
- `delivery_events`
- `crm_notes`
- `customer_tags`
- `subscriptions`
- `ai_logs`

Tambien crea buckets `store-assets`, `delivery-proofs` y `marketing-assets`, helpers privados para RLS y grants explicitos para Data API. RLS separa datos por tenant, permite que mensajeros vean solo entregas asignadas y mantiene `invoices` visible solo para staff del negocio.

Migracion contable:

```bash
supabase/migrations/0002_accounting_invoices.sql
```

Esta migracion crea `invoices` para facturacion y auxiliar IVA por `business_id`.
Si Supabase muestra `relation "public.businesses" does not exist`, primero corre
`0001_righthand_schema_fixed.sql`; esa migracion crea la tabla base `businesses` y los
helpers privados que `0002` necesita para contabilidad y RLS.

Migracion de planes:

```bash
supabase/migrations/0003_subscription_entitlements.sql
```

Esta migracion deja todos los negocios nuevos en plan Gratis, conserva
`ronnywoods77@gmail.com` como Pro y sincroniza el plan del negocio cuando PayPal
activa, cancela o suspende una suscripcion.

Migracion de buscador:

```bash
supabase/migrations/0004_business_discovery_profile.sql
```

Esta migracion agrega provincia, ciudad, tipo de negocio, estilo, resumen de
oferta, palabras clave e indice de busqueda a `businesses`. La busqueda se
mantiene con trigger para evitar errores de columnas generadas no inmutables.

Migracion de ubicacion Waze:

```bash
supabase/migrations/0005_store_waze_locations.sql
```

Esta migracion agrega direccion fisica, latitud y longitud a `stores` para
mostrar el boton "Abrir en Waze" en cada tienda publica.

Migracion de ofertas:

```bash
supabase/migrations/0006_business_offers.sql
```

Esta migracion crea `business_offers` con RLS por `business_id`. Las ofertas
activas de tiendas publicadas son visibles en landing, perfil publico y AI
Concierge; owner/admin/sales pueden administrarlas.

Migracion de marketing:

```bash
supabase/migrations/0007_marketing_campaigns.sql
```

Esta migracion crea `marketing_campaigns` y el bucket `marketing-assets` para
anuncios, referencias y enlaces Canva por negocio. El acceso queda limitado por
RLS a owner/admin/sales del tenant.

## AI Delivery Manager

Endpoint:

```http
POST /api/ai/delivery-manager
```

Recibe pedidos pendientes, direcciones, zonas, mensajeros disponibles, horario y tiempos estimados. Devuelve prioridades, rutas, Waze links, mensajero recomendado, mensajes transaccionales, alertas de atraso y sugerencias operativas.

## AI Store Concierge

Endpoint:

```http
POST /api/ai/store-concierge
```

El boton flotante global consulta este endpoint para responder en el idioma del visitante y recomendar negocios afiliados de RightHand sin filtrar por plan. En produccion lee tiendas publicadas desde Supabase con `SUPABASE_SERVICE_ROLE_KEY`; en local o sin llave usa los datos demo.

## Marketing Digital

Endpoint de imagen:

```http
POST /api/ai/marketing-image
```

Usa `OPENAI_IMAGE_MODEL` para generar anuncios. Por defecto queda en
`gpt-image-2`. Si no hay `OPENAI_API_KEY`, crea un mockup SVG local para que el
flujo siga funcionando.

Endpoint Canva:

```http
POST /api/canva/create-design
```

Usa Canva Connect API con `CANVA_ACCESS_TOKEN`. Si el token existe y tiene
scopes `asset:write`, `asset:read` y `design:content:write`, RightHand sube la
imagen generada como asset y crea un diseno editable. TODO produccion: cambiar
el token manual por OAuth por usuario/negocio.

## PayPal

La pantalla `/dashboard/billing` renderiza botones oficiales de PayPal para:

- **PYME:** `P-7ER35589F36485216NIGO3JQ`
- **Pro:** `P-8BN67865HY6507532NIGO4PI`

Endpoints:

```http
POST /api/paypal/create-subscription
POST /api/paypal/activate-subscription
POST /api/paypal/webhook
```

Variables clave:

- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_PLAN_PYME_ID`
- `PAYPAL_PLAN_PRO_ID`
- `PAYPAL_WEBHOOK_ID`

TODO produccion: persistir eventos verificados en `subscriptions` y mapear `paypal_subscription_id` contra `business_id`.

## Plan Comercial Costa Rica

- **Plan Gratis:** 20 productos, 30 pedidos/mes.
- **Plan PYME:** $19/mes, productos ilimitados, CRM, entregas.
- **Plan Pro:** $49/mes, AI Delivery Manager, mensajeros, reportes.
- **Plan Enterprise:** personalizado.

## Datos Demo

Incluye una soda/restaurante, una tienda de ropa y una farmacia:

- `Soda Luna` en `/tienda/soda-luna`
- `Moda Tica` en `/tienda/moda-tica`
- `Farma Central` en `/tienda/farma-central`

Cada negocio trae productos, zonas, clientes, pedidos y mensajeros de ejemplo. No se usan datos reales.

## Verificacion

```bash
npm run typecheck
npm run build
npm run lint
```

En Vercel el Build Command debe ser `npm run build`, no `npm build`.

## TODOs Para Produccion

- Crear flujo owner onboarding que inserte `businesses`, `stores` y `business_members` despues de Supabase Auth.
- Persistir checkout real con Server Actions o Route Handlers usando `SUPABASE_SERVICE_ROLE_KEY`.
- Conectar Storage uploads para logos, portadas y fotos de entrega.
- Activar PayPal webhook persistence y reconciliacion de planes.
- Configurar WhatsApp Business solo para mensajes transaccionales de estado.
- Agregar pruebas end-to-end para RLS, checkout, webhooks y flujo courier.
- Rotar claves, configurar Vercel env vars y revisar `npm audit` antes de produccion.
