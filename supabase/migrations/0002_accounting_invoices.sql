-- RightHand accounting invoices and Costa Rica IVA auxiliary.
-- Apply after 0001_righthand_init.sql.

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  document_number text not null,
  document_type text not null default 'factura',
  issued_at timestamptz not null default now(),
  customer_name text not null,
  customer_tax_id text,
  currency text not null default 'CRC',
  taxable_amount numeric(12, 2) not null default 0 check (taxable_amount >= 0),
  exempt_amount numeric(12, 2) not null default 0 check (exempt_amount >= 0),
  tax_rate numeric(7, 6) not null default 0.13 check (tax_rate >= 0),
  tax_amount numeric(12, 2) not null default 0 check (tax_amount >= 0),
  total_amount numeric(12, 2) not null default 0 check (total_amount >= 0),
  status text not null default 'issued' check (status in ('draft', 'issued', 'paid', 'void')),
  source text not null default 'order' check (source in ('order', 'manual')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, document_number)
);

create index if not exists idx_invoices_business_issued
  on public.invoices(business_id, issued_at desc);

create index if not exists idx_invoices_order
  on public.invoices(order_id);

alter table public.invoices enable row level security;

drop policy if exists "invoices_staff_select" on public.invoices;
create policy "invoices_staff_select" on public.invoices
  for select using (
    app_private.is_business_member(
      business_id,
      array['owner','admin','sales']::public.business_role[]
    )
  );

drop policy if exists "invoices_staff_write" on public.invoices;
create policy "invoices_staff_write" on public.invoices
  for all using (
    app_private.is_business_member(
      business_id,
      array['owner','admin','sales']::public.business_role[]
    )
  )
  with check (
    app_private.is_business_member(
      business_id,
      array['owner','admin','sales']::public.business_role[]
    )
  );

drop trigger if exists touch_invoices_updated_at on public.invoices;
create trigger touch_invoices_updated_at
  before update on public.invoices
  for each row execute function public.touch_updated_at();

grant select, insert, update, delete on public.invoices to anon, authenticated;
