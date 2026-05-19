# RightHand

RightHand es una web app SaaS multi-tenant para pequenas empresas y PYMES de Costa Rica. Combina tienda en linea, CRM, pedidos, inventario basico, mensajeros independientes y un AI Delivery Manager que organiza entregas, genera rutas con Waze Deep Links y ayuda a vender mejor.

Slogan: **La mano derecha de tu tienda.**

## Arquitectura Corta

- **Frontend:** Next.js 14 App Router, TypeScript, Tailwind CSS y componentes estilo shadcn/ui.
- **Dominio multi-tenant:** todas las tablas operativas usan `business_id`; miembros y roles viven en `business_members`.
- **Datos:** Supabase Auth, Postgres, Storage y RLS. El MVP corre localmente con datos demo en `src/lib/mock-data.ts`.
- **AI Manager:** `POST /api/ai/delivery-manager` usa OpenAI Responses API con salida estructurada; si no hay `OPENAI_API_KEY`, responde con heuristica local.
- **Pagos:** rutas PayPal para crear suscripciones y recibir webhooks, con modo demo si faltan credenciales.
- **Entregas:** `generateWazeLink({ lat, lng, address })` usa lat/lng cuando existen y fallback por direccion.

## Paginas Incluidas

- `/`
- `/login`
- `/register`
- `/dashboard`
- `/dashboard/store`
- `/dashboard/products`
- `/dashboard/orders`
- `/dashboard/customers`
- `/dashboard/deliveries`
- `/dashboard/couriers`
- `/dashboard/ai-manager`
- `/dashboard/billing`
- `/courier`
- `/courier/orders`
- `/tienda/[slug]`
- `/tienda/[slug]/checkout`
- `/order/[publicTrackingCode]`

## Instalacion Local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

Sin variables de entorno, login/register entran en modo demo y el AI Manager usa heuristica local. Para conectar servicios reales:

```bash
cp .env.example .env.local
```

Luego completa Supabase, OpenAI y PayPal.

Para publicar y conectar APIs paso a paso, usa [docs/CONNECT_APIS.md](docs/CONNECT_APIS.md).

## Modo Demo Interactivo

Las pantallas de dashboard usan `localStorage` para que los botones funcionen sin backend real:

- Guardar identidad de tienda, logo y portada.
- Crear productos y ajustar stock.
- Avanzar o cancelar pedidos.
- Agregar notas CRM.
- Invitar mensajeros y cambiar disponibilidad.
- Marcar entregas como recogidas/entregadas y adjuntar foto.
- Activar planes con PayPal en modo demo.

Para reiniciar la demo, borra las claves del navegador que empiezan con `righthand:`.

## Supabase

SQL principal:

```bash
supabase/migrations/0001_righthand_init.sql
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
- `delivery_zones`
- `couriers`
- `deliveries`
- `delivery_events`
- `crm_notes`
- `customer_tags`
- `subscriptions`
- `ai_logs`

Tambien crea buckets `store-assets` y `delivery-proofs`, helpers privados para RLS y grants explicitos para Data API. RLS separa datos por tenant y permite que mensajeros vean solo entregas asignadas.

## AI Delivery Manager

Endpoint:

```http
POST /api/ai/delivery-manager
```

Recibe pedidos pendientes, direcciones, zonas, mensajeros disponibles, horario y tiempos estimados. Devuelve prioridades, rutas, Waze links, mensajero recomendado, mensajes transaccionales, alertas de atraso y sugerencias operativas.

## PayPal

Endpoints:

```http
POST /api/paypal/create-subscription
POST /api/paypal/webhook
```

Variables clave:

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

## TODOs Para Produccion

- Crear flujo owner onboarding que inserte `businesses`, `stores` y `business_members` despues de Supabase Auth.
- Persistir checkout real con Server Actions o Route Handlers usando `SUPABASE_SERVICE_ROLE_KEY`.
- Conectar Storage uploads para logos, portadas y fotos de entrega.
- Activar PayPal webhook persistence y reconciliacion de planes.
- Configurar WhatsApp Business solo para mensajes transaccionales de estado.
- Agregar pruebas end-to-end para RLS, checkout, webhooks y flujo courier.
- Rotar claves, configurar Vercel env vars y revisar `npm audit` antes de produccion.
