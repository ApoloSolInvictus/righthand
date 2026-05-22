# RightHand: conectar APIs y publicar en vivo

Esta guia asume que el codigo ya esta en GitHub en:

`https://github.com/ApoloSolInvictus/righthand.git`

## 1. Vercel

1. Entra a Vercel.
2. Importa el repositorio `ApoloSolInvictus/righthand`.
3. Framework: `Next.js`.
4. Build command: `npm run build`.
5. Install command: `npm install`.
6. Output directory: deja el valor automatico de Next.js.
7. En `Settings > Environment Variables`, agrega las variables de `.env.example`.
8. Haz deploy.

Variables minimas para que el demo publique:

```env
NEXT_PUBLIC_APP_URL=https://TU-DOMINIO.vercel.app
```

Sin APIs reales, RightHand sigue funcionando en modo demo local del navegador.

Puedes revisar el estado del deploy en:

```text
https://TU-DOMINIO.vercel.app/api/health
```

Si Vercel muestra `Error: Command "npm build" exited with 1`, cambia el Build Command en `Project Settings > Build & Development Settings` a:

```bash
npm run build
```

`npm build` no es un comando valido de npm. Este repo incluye `vercel.json` para que los nuevos deploys usen `npm run build` automaticamente.

Docs utiles:

- Vercel env vars: https://vercel.com/docs/environment-variables
- Next.js env vars: https://nextjs.org/docs/pages/guides/environment-variables

## 2. Supabase

1. Crea un proyecto nuevo en Supabase, dedicado solo a RightHand.
2. Ve a SQL Editor.
3. Ejecuta `supabase/migrations/0001_righthand_schema_fixed.sql`.
4. Ejecuta `supabase/migrations/0002_accounting_invoices.sql`.
5. Ejecuta `supabase/migrations/0003_subscription_entitlements.sql`.
6. Ejecuta `supabase/migrations/0004_business_discovery_profile.sql`.
7. Ejecuta `supabase/migrations/0005_store_waze_locations.sql`.
8. Ejecuta `supabase/migrations/0006_business_offers.sql`.
9. Ejecuta `supabase/migrations/0007_marketing_campaigns.sql`.
10. Ejecuta `supabase/seed.sql` si quieres los datos demo en la base.
11. Ve a Project Settings / API Keys.
12. Copia Project URL.
13. Copia Publishable key o anon key.
14. Copia una Secret key o la legacy Service role key solo para servidor.
15. Agrega en Vercel:

Nota: si al ejecutar `0002_accounting_invoices.sql` aparece
`relation "public.businesses" does not exist`, falta el paso 3. Ejecuta primero
`0001_righthand_schema_fixed.sql` y luego vuelve a correr `0002`.

Nota: si una copia vieja de `0004_business_discovery_profile.sql` muestra
`generation expression is not immutable`, usa la version actual del repo. El
indice de busqueda ahora se mantiene con trigger y ya no usa columna generada.

```env
NEXT_PUBLIC_RIGHTHAND_SUPABASE_ENABLED=false
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=...
```

Primero deja `NEXT_PUBLIC_RIGHTHAND_SUPABASE_ENABLED=false`. Cuando confirmes que
la URL y el `projectRef` corresponden al proyecto nuevo de RightHand, cambia la
bandera a:

```env
NEXT_PUBLIC_RIGHTHAND_SUPABASE_ENABLED=true
```

Importante:

- Nunca pongas `SUPABASE_SERVICE_ROLE_KEY` con prefijo `NEXT_PUBLIC_`.
- En Supabase, la llave recomendada para servidor puede aparecer como `Secret key` (`sb_secret_...`). Si tu proyecto todavia usa llaves legacy, usa `service_role`. En ambos casos pegala en Vercel como `SUPABASE_SERVICE_ROLE_KEY`.
- No reutilices un proyecto Supabase de otra app. Si usas la misma URL/key, los datos quedan en la misma base.
- RLS ya esta activado en el SQL.
- `invoices` guarda facturas y auxiliar IVA por `business_id`, visible para owner/admin/sales.
- `businesses` guarda provincia, ciudad, tipo, estilo, oferta, tags e indice de busqueda para el directorio publico.
- `stores` guarda direccion fisica, latitud y longitud para el boton Waze publico.
- `business_offers` guarda promociones con texto e imagen para landing, tienda publica y AI Concierge.
- `marketing_campaigns` guarda anuncios, referencias, copy y enlaces Canva por negocio.
- Buckets creados: `store-assets`, `delivery-proofs` y `marketing-assets`.

Docs utiles:

- Supabase Next.js: https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs
- Supabase API keys: https://supabase.com/docs/guides/api/api-keys

## 3. OpenAI

1. Entra a OpenAI Platform.
2. Crea o usa un proyecto.
3. Crea una API key del proyecto.
4. Agrega en Vercel:

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.4-mini
OPENAI_IMAGE_MODEL=gpt-image-2
OPENAI_TIMEOUT_MS=15000
OPENAI_IMAGE_TIMEOUT_MS=120000
```

`OPENAI_TIMEOUT_MS` no se copia de OpenAI. Es un valor propio de RightHand:
usa `15000` para esperar hasta 15 segundos antes de activar la respuesta
heuristica local.

`OPENAI_IMAGE_TIMEOUT_MS` tampoco se copia de OpenAI; usa `120000` porque las
imagenes complejas pueden tardar mas que una respuesta de texto.

Endpoints que usan esta key:

```http
POST /api/ai/delivery-manager
POST /api/ai/store-concierge
POST /api/ai/marketing-image
```

Si no hay key, o si OpenAI no responde antes del timeout, los endpoints responden con heuristica local. El AI Store Concierge usa Supabase cuando `SUPABASE_SERVICE_ROLE_KEY` esta configurada y recomienda tiendas publicadas sin filtrar por plan. Marketing Digital usa `gpt-image-2` por defecto y crea un mockup local cuando no hay key.

Docs utiles:

- Project API keys: https://platform.openai.com/docs/api-reference/project-api-keys
- Responses/text generation: https://platform.openai.com/docs/guides/text
- Image generation: https://developers.openai.com/api/docs/guides/image-generation

## 4. Canva Connect

RightHand crea disenos Canva desde `/dashboard/marketing` con:

```http
POST /api/canva/create-design
```

Para activar Canva Connect:

1. Entra a Canva Developers.
2. Crea una integracion Connect.
3. Configura OAuth para obtener un access token por usuario/negocio.
4. Asegura scopes:
   - `asset:write`
   - `asset:read`
   - `design:content:write`
5. Para pruebas privadas, pega un access token temporal en Vercel:

```env
CANVA_ACCESS_TOKEN=...
```

Importante: el token actua en nombre de un usuario de Canva. Para produccion,
reemplaza el token manual por OAuth y guarda tokens por tenant. RightHand ya
deja el TODO marcado en `.env.example`.

Docs utiles:

- Canva Connect APIs: https://www.canva.dev/docs/connect/
- Create design: https://www.canva.dev/docs/connect/api-reference/designs/create-design/
- Asset upload: https://www.canva.dev/docs/connect/api-reference/assets/create-asset-upload-job/

## 5. PayPal Subscriptions

RightHand usa los botones oficiales de PayPal en `/dashboard/billing`. El SDK se carga una sola vez y renderiza:

- PYME: `P-7ER35589F36485216NIGO3JQ`
- Pro: `P-8BN67865HY6507532NIGO4PI`

1. Entra a PayPal Developer Dashboard.
2. Abre la REST app Live de RightHand.
3. Copia Client ID y Client Secret.
4. Confirma que los planes Live PYME y Pro esten activos.
5. Crea un webhook apuntando a:

```text
https://TU-DOMINIO.vercel.app/api/paypal/webhook
```

6. Suscribe eventos:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `BILLING.SUBSCRIPTION.PAYMENT.FAILED`
   - `PAYMENT.SALE.COMPLETED`
   - `PAYMENT.SALE.DENIED`
7. Copia el Webhook ID.
8. Agrega en Vercel:

```env
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
PAYPAL_ENVIRONMENT=live
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_PLAN_PYME_ID=P-7ER35589F36485216NIGO3JQ
PAYPAL_PLAN_PRO_ID=P-8BN67865HY6507532NIGO4PI
PAYPAL_WEBHOOK_ID=...
```

Endpoints:

```http
POST /api/paypal/create-subscription
POST /api/paypal/activate-subscription
POST /api/paypal/webhook
```

Docs utiles:

- Multiple subscription buttons: https://developer.paypal.com/docs/subscriptions/customize/multiple-buttons-website/
- Subscriptions webhooks: https://developer.paypal.com/docs/subscriptions/reference/webhooks/
- Verify webhook signature: https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature_post

## 6. WhatsApp Business opcional

RightHand lo deja como soporte transaccional. Conectalo solo para estados de pedidos.

Variables reservadas:

```env
WHATSAPP_BUSINESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
```

Flujos recomendados:

- Pedido confirmado.
- Pedido listo.
- Pedido en ruta.
- Pedido entregado.
- Pedido atrasado.

## 7. Checklist final de produccion

1. Configurar dominio en Vercel.
2. Cambiar `NEXT_PUBLIC_APP_URL` al dominio final.
3. Configurar redirect URLs en Supabase Auth.
4. Ejecutar SQL/RLS en Supabase.
5. Agregar variables de entorno en Vercel para Production.
6. Confirmar `/api/health` y activar `NEXT_PUBLIC_RIGHTHAND_SUPABASE_ENABLED=true`.
7. Hacer deploy.
8. Crear usuario owner.
9. Revisar que login, dashboard, checkout y webhook respondan.
10. Pasar PayPal de sandbox a live cuando las pruebas esten listas.
11. Rotar llaves antes de lanzar publicamente si alguna fue compartida por accidente.
