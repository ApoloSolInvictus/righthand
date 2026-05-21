-- Demo seed data for local development. No real customer data.

insert into public.businesses (
  id,
  name,
  slug,
  legal_name,
  phone,
  email,
  plan,
  province,
  city,
  business_category,
  business_style,
  offer_summary,
  search_tags
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'Soda Luna',
    'soda-luna',
    'Soda Luna Demo S.A.',
    '+506 2222-1000',
    'hola+soda@example.com',
    'free',
    'San Jose',
    'San Pedro',
    'restaurante',
    'Comida casera costarricense',
    'Casados, chifrijos, frescos naturales y almuerzos ejecutivos para oficina.',
    array['soda', 'casados', 'almuerzos', 'express', 'comida tica']
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Moda Tica',
    'moda-tica',
    'Moda Tica Demo S.R.L.',
    '+506 2222-2000',
    'hola+moda@example.com',
    'free',
    'San Jose',
    'Escazu',
    'tienda',
    'Ropa casual femenina',
    'Blusas, jeans, basicos y outfits casuales con cambios coordinados.',
    array['ropa', 'moda', 'blusas', 'jeans', 'outfits']
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'Farma Central',
    'farma-central',
    'Farma Central Demo S.A.',
    '+506 2222-3000',
    'hola+farma@example.com',
    'free',
    'San Jose',
    'Rohrmoser',
    'farmacia',
    'Farmacia de barrio',
    'Medicamentos, vitaminas, cuidado personal y entregas programadas.',
    array['farmacia', 'vitaminas', 'medicamentos', 'salud', 'entrega']
  )
on conflict (id) do nothing;

insert into public.stores (
  id, business_id, slug, name, description, logo_url, cover_url,
  primary_color, success_color, delivery_color, hours, is_published
)
values
  (
    'aaaaaaaa-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'soda-luna',
    'Soda Luna',
    'Comida casera y express para oficinas en San Pedro.',
    'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80',
    '#103A5C',
    '#219E6B',
    '#F97316',
    '{"monday":"7:00-20:00","saturday":"7:00-20:00"}',
    true
  ),
  (
    'aaaaaaaa-2222-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222222',
    'moda-tica',
    'Moda Tica',
    'Ropa casual con entregas y cambios coordinados.',
    'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80',
    '#173B57',
    '#22A06B',
    '#EA7A24',
    '{"monday":"10:00-19:00","friday":"10:00-19:00"}',
    true
  ),
  (
    'aaaaaaaa-3333-4333-8333-333333333333',
    '33333333-3333-4333-8333-333333333333',
    'farma-central',
    'Farma Central',
    'Farmacia de barrio con entregas programadas.',
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=1600&q=80',
    '#103A5C',
    '#1F9D6A',
    '#F97316',
    '{"daily":"8:00-21:00"}',
    true
  )
on conflict (id) do nothing;

insert into public.delivery_zones (id, business_id, name, fee, eta_minutes)
values
  ('bbbbbbbb-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'San Pedro', 1200, 25),
  ('bbbbbbbb-1111-4111-8111-222222222222', '11111111-1111-4111-8111-111111111111', 'Curridabat', 1800, 35),
  ('bbbbbbbb-2222-4222-8222-111111111111', '22222222-2222-4222-8222-222222222222', 'Escazu', 2200, 45),
  ('bbbbbbbb-3333-4333-8333-111111111111', '33333333-3333-4333-8333-333333333333', 'Rohrmoser', 1500, 30)
on conflict (id) do nothing;

insert into public.product_categories (id, business_id, name, sort_order)
values
  ('cccccccc-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'Almuerzos', 1),
  ('cccccccc-1111-4111-8111-222222222222', '11111111-1111-4111-8111-111111111111', 'Bebidas', 2),
  ('cccccccc-2222-4222-8222-111111111111', '22222222-2222-4222-8222-222222222222', 'Blusas', 1),
  ('cccccccc-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', 'Basicos', 2),
  ('cccccccc-3333-4333-8333-111111111111', '33333333-3333-4333-8333-333333333333', 'Farmacia', 1)
on conflict (id) do nothing;

insert into public.products (
  id, business_id, category_id, name, description, image_url, price, cost, stock, sku, active
)
values
  ('dddddddd-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'cccccccc-1111-4111-8111-111111111111', 'Casado con pollo', 'Arroz, frijoles, ensalada, maduro y pollo en salsa.', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=700&q=80', 4200, 2350, 28, 'SL-CAS-POLLO', true),
  ('dddddddd-1111-4111-8111-222222222222', '11111111-1111-4111-8111-111111111111', 'cccccccc-1111-4111-8111-111111111111', 'Chifrijo ejecutivo', 'Chicharron, frijoles tiernos, pico de gallo y chips.', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=700&q=80', 4800, 2600, 18, 'SL-CHIFRIJO', true),
  ('dddddddd-2222-4222-8222-111111111111', '22222222-2222-4222-8222-222222222222', 'cccccccc-2222-4222-8222-111111111111', 'Blusa lino terracota', 'Tallas S-M-L, corte fresco para oficina.', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80', 16900, 8800, 12, 'MT-BLUSA-LINO', true),
  ('dddddddd-3333-4333-8333-111111111111', '33333333-3333-4333-8333-333333333333', 'cccccccc-3333-4333-8333-111111111111', 'Vitamina C 1000 mg', 'Frasco de 60 tabletas.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=700&q=80', 6900, 4100, 35, 'FC-VITC-60', true)
on conflict (id) do nothing;

insert into public.customers (id, business_id, name, phone, email, birthday, total_orders, total_spent, last_order_at)
values
  ('eeeeeeee-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'Maria Fernanda Rojas', '+506 8888-1111', 'maria.demo@example.com', '1991-06-14', 12, 62400, now() - interval '2 hours'),
  ('eeeeeeee-1111-4111-8111-222222222222', '11111111-1111-4111-8111-111111111111', 'Esteban Vargas', '+506 8999-2222', null, '1986-11-03', 8, 45800, now() - interval '1 hour'),
  ('eeeeeeee-2222-4222-8222-111111111111', '22222222-2222-4222-8222-222222222222', 'Paola Jimenez', '+506 8777-3333', null, '1994-09-21', 5, 116500, now() - interval '1 day'),
  ('eeeeeeee-3333-4333-8333-111111111111', '33333333-3333-4333-8333-333333333333', 'Jorge Mora', '+506 8666-4444', null, null, 4, 27600, now() - interval '2 days')
on conflict (id) do nothing;

insert into public.customer_tags (business_id, customer_id, tag)
values
  ('11111111-1111-4111-8111-111111111111', 'eeeeeeee-1111-4111-8111-111111111111', 'frecuente'),
  ('11111111-1111-4111-8111-111111111111', 'eeeeeeee-1111-4111-8111-222222222222', 'empresa'),
  ('22222222-2222-4222-8222-222222222222', 'eeeeeeee-2222-4222-8222-111111111111', 'VIP'),
  ('33333333-3333-4333-8333-333333333333', 'eeeeeeee-3333-4333-8333-111111111111', 'mensual')
on conflict do nothing;

insert into public.orders (
  id, business_id, customer_id, public_tracking_code, status, customer_name,
  customer_phone, delivery_address, delivery_lat, delivery_lng, zone_name,
  subtotal, delivery_fee, total, promised_at
)
values
  ('ffffffff-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'eeeeeeee-1111-4111-8111-111111111111', 'RH-SL-1001', 'ready_for_delivery', 'Maria Fernanda Rojas', '+506 8888-1111', 'Barrio Dent, San Pedro, Montes de Oca', 9.9329000, -84.0508000, 'San Pedro', 9600, 1200, 10800, now() + interval '20 minutes'),
  ('ffffffff-1111-4111-8111-222222222222', '11111111-1111-4111-8111-111111111111', 'eeeeeeee-1111-4111-8111-222222222222', 'RH-SL-1002', 'preparing', 'Esteban Vargas', '+506 8999-2222', 'Pinares, Curridabat', 9.9159000, -84.0334000, 'Curridabat', 13800, 1800, 15600, now() + interval '45 minutes'),
  ('ffffffff-2222-4222-8222-111111111111', '22222222-2222-4222-8222-222222222222', 'eeeeeeee-2222-4222-8222-111111111111', 'RH-MT-2001', 'in_route', 'Paola Jimenez', '+506 8777-3333', 'Centro Comercial Paco, Escazu', null, null, 'Escazu', 24900, 2200, 27100, now() + interval '35 minutes'),
  ('ffffffff-3333-4333-8333-111111111111', '33333333-3333-4333-8333-333333333333', 'eeeeeeee-3333-4333-8333-111111111111', 'RH-FC-3001', 'confirmed', 'Jorge Mora', '+506 8666-4444', 'Rohrmoser, frente a Plaza Mayor', null, null, 'Rohrmoser', 9500, 1500, 11000, now() + interval '6 hours')
on conflict (id) do nothing;

insert into public.invoices (
  business_id, order_id, customer_id, document_number, document_type,
  issued_at, customer_name, currency, taxable_amount, exempt_amount,
  tax_rate, tax_amount, total_amount, status, source
)
select
  business_id,
  id,
  customer_id,
  'FAC-' || public_tracking_code,
  'factura',
  created_at,
  customer_name,
  'CRC',
  round(total / 1.13, 2),
  0,
  0.13,
  total - round(total / 1.13, 2),
  total,
  case when status = 'cancelled' then 'void' else 'issued' end,
  'order'
from public.orders
where public_tracking_code in ('RH-SL-1001', 'RH-SL-1002', 'RH-MT-2001', 'RH-FC-3001')
on conflict (business_id, document_number) do nothing;

insert into public.order_items (business_id, order_id, product_id, product_name, quantity, unit_price)
values
  ('11111111-1111-4111-8111-111111111111', 'ffffffff-1111-4111-8111-111111111111', 'dddddddd-1111-4111-8111-222222222222', 'Chifrijo ejecutivo', 2, 4800),
  ('11111111-1111-4111-8111-111111111111', 'ffffffff-1111-4111-8111-222222222222', 'dddddddd-1111-4111-8111-111111111111', 'Casado con pollo', 3, 4200),
  ('22222222-2222-4222-8222-222222222222', 'ffffffff-2222-4222-8222-111111111111', 'dddddddd-2222-4222-8222-111111111111', 'Blusa lino terracota', 1, 16900),
  ('33333333-3333-4333-8333-333333333333', 'ffffffff-3333-4333-8333-111111111111', 'dddddddd-3333-4333-8333-111111111111', 'Vitamina C 1000 mg', 1, 6900);

insert into public.couriers (id, business_id, name, phone, zone, available, commission_per_delivery)
values
  ('99999999-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'Andres Solis', '+506 8555-1010', 'San Pedro / Curridabat', true, 1600),
  ('99999999-1111-4111-8111-222222222222', '11111111-1111-4111-8111-111111111111', 'Lucia Navarro', '+506 8555-2020', 'Este GAM', true, 1800),
  ('99999999-2222-4222-8222-111111111111', '22222222-2222-4222-8222-222222222222', 'David Chaves', '+506 8555-3030', 'Oeste GAM', false, 2200)
on conflict (id) do nothing;

insert into public.deliveries (
  id, business_id, order_id, courier_id, status, pickup_address,
  dropoff_address, dropoff_lat, dropoff_lng
)
values
  ('88888888-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'ffffffff-1111-4111-8111-111111111111', '99999999-1111-4111-8111-111111111111', 'assigned', 'Soda Luna, San Pedro', 'Barrio Dent, San Pedro, Montes de Oca', 9.9329000, -84.0508000),
  ('88888888-2222-4222-8222-111111111111', '22222222-2222-4222-8222-222222222222', 'ffffffff-2222-4222-8222-111111111111', '99999999-2222-4222-8222-111111111111', 'picked_up', 'Moda Tica, Sabana', 'Centro Comercial Paco, Escazu', null, null)
on conflict (id) do nothing;
