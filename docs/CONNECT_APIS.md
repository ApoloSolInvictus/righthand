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

Docs utiles:

- Vercel env vars: https://vercel.com/docs/environment-variables
- Next.js env vars: https://nextjs.org/docs/pages/guides/environment-variables

## 2. Supabase

1. Crea un proyecto en Supabase.
2. Ve a SQL Editor.
3. Ejecuta `supabase/migrations/0001_righthand_init.sql`.
4. Ejecuta `supabase/seed.sql` si quieres los datos demo en la base.
5. Ve a Project Settings / API.
6. Copia Project URL.
7. Copia Publishable key o anon key.
8. Copia Service role key solo para servidor.
9. Agrega en Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=...
```

Importante:

- Nunca pongas `SUPABASE_SERVICE_ROLE_KEY` con prefijo `NEXT_PUBLIC_`.
- RLS ya esta activado en el SQL.
- Buckets creados: `store-assets` y `delivery-proofs`.

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
```

Endpoint que usa esta key:

```http
POST /api/ai/delivery-manager
```

Si no hay key, el endpoint responde con heuristica local.

Docs utiles:

- Project API keys: https://platform.openai.com/docs/api-reference/project-api-keys
- Responses/text generation: https://platform.openai.com/docs/guides/text

## 4. PayPal Subscriptions

1. Entra a PayPal Developer Dashboard.
2. Crea una REST app en Sandbox primero.
3. Crea productos/planes para:
   - Plan PYME: 19 USD/mes.
   - Plan Pro: 49 USD/mes.
4. Copia Client ID y Client Secret.
5. Copia los IDs de planes.
6. Crea un webhook apuntando a:

```text
https://TU-DOMINIO.vercel.app/api/paypal/webhook
```

7. Suscribe eventos:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `PAYMENT.SALE.COMPLETED`
   - `PAYMENT.SALE.DENIED`
8. Copia el Webhook ID.
9. Agrega en Vercel:

```env
PAYPAL_ENVIRONMENT=sandbox
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_PLAN_PYME_ID=P-...
PAYPAL_PLAN_PRO_ID=P-...
PAYPAL_WEBHOOK_ID=...
```

Endpoints:

```http
POST /api/paypal/create-subscription
POST /api/paypal/webhook
```

Docs utiles:

- Subscriptions webhooks: https://developer.paypal.com/docs/subscriptions/reference/webhooks/
- Verify webhook signature: https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature_post

## 5. WhatsApp Business opcional

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

## 6. Checklist final de produccion

1. Configurar dominio en Vercel.
2. Cambiar `NEXT_PUBLIC_APP_URL` al dominio final.
3. Configurar redirect URLs en Supabase Auth.
4. Ejecutar SQL/RLS en Supabase.
5. Agregar variables de entorno en Vercel para Production.
6. Hacer deploy.
7. Crear usuario owner.
8. Revisar que login, dashboard, checkout y webhook respondan.
9. Pasar PayPal de sandbox a live cuando las pruebas esten listas.
10. Rotar llaves antes de lanzar publicamente si alguna fue compartida por accidente.
