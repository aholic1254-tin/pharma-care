-- ============================================================
-- PharmaCare — Initial Schema
-- Migration: 001_initial_schema.sql
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── Drug Forms ──────────────────────────────────────────────
create table drug_forms (
  id          serial primary key,
  name        text not null unique,
  sort_order  int  not null unique
);

insert into drug_forms (name, sort_order) values
  ('Tablet',       1),
  ('Syrup',        2),
  ('Injection',    3),
  ('External Use', 4),
  ('Herbal',       5);

-- ─── Suppliers ───────────────────────────────────────────────
create table suppliers (
  id         serial primary key,
  name       text not null unique,
  created_at timestamptz not null default now()
);

-- ─── Package Types ───────────────────────────────────────────
create table package_types (
  id         serial primary key,
  name       text not null unique,
  created_at timestamptz not null default now()
);

-- ─── Drugs ───────────────────────────────────────────────────
create table drugs (
  id              serial primary key,
  drug_id         text not null unique,          -- human-readable code e.g. "D001"
  name            text not null,
  drug_form_id    int  not null references drug_forms(id),
  unit            text not null default 'tablet', -- tablet / bottle / vial / ampule / tube / etc.
  minimum_stock   int  not null default 0,
  image_url       text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_drugs_drug_form_id on drugs(drug_form_id);
create index idx_drugs_name        on drugs(name);

-- ─── Drug Barcodes ───────────────────────────────────────────
create table drug_barcodes (
  id         serial primary key,
  drug_id    int  not null references drugs(id) on delete cascade,
  barcode    text not null unique,
  created_at timestamptz not null default now()
);

create index idx_drug_barcodes_drug_id on drug_barcodes(drug_id);
create index idx_drug_barcodes_barcode on drug_barcodes(barcode);

-- ─── LOTs ────────────────────────────────────────────────────
create table lots (
  id                 serial primary key,
  drug_id            int     not null references drugs(id) on delete restrict,
  lot_code           text    not null,
  receive_date       date    not null,
  expiry_date        date    not null,
  remaining_quantity int     not null default 0 check (remaining_quantity >= 0),
  unit_price         numeric(12,2) not null default 0 check (unit_price >= 0),
  supplier_id        int     references suppliers(id) on delete set null,
  package_type_id    int     references package_types(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  unique (drug_id, lot_code)
);

create index idx_lots_drug_id     on lots(drug_id);
create index idx_lots_expiry_date on lots(expiry_date);
create index idx_lots_lot_code    on lots(lot_code);

-- ─── Receive Transactions ─────────────────────────────────────
create table receive_transactions (
  id              serial primary key,
  drug_id         int     not null references drugs(id) on delete restrict,
  lot_id          int     not null references lots(id)  on delete restrict,
  receive_date    date    not null,
  lot_code        text    not null,
  quantity        int     not null check (quantity > 0),
  expiry_date     date    not null,
  unit_price      numeric(12,2) not null default 0,
  package_type_id int     references package_types(id) on delete set null,
  supplier_id     int     references suppliers(id)      on delete set null,
  note            text,
  created_at      timestamptz not null default now()
);

create index idx_receive_drug_id      on receive_transactions(drug_id);
create index idx_receive_lot_id       on receive_transactions(lot_id);
create index idx_receive_receive_date on receive_transactions(receive_date desc);

-- ─── Dispense Transactions ────────────────────────────────────
-- One row per LOT consumed. A single dispense event that spans
-- multiple LOTs produces multiple rows sharing the same created_at
-- (or a group_id if grouping is needed in the future).
create table dispense_transactions (
  id             serial primary key,
  drug_id        int  not null references drugs(id) on delete restrict,
  lot_id         int  not null references lots(id)  on delete restrict,
  dispense_date  date not null,
  quantity       int  not null check (quantity > 0),
  patient_name   text,                         -- optional
  note           text,
  created_at     timestamptz not null default now()
);

create index idx_dispense_drug_id      on dispense_transactions(drug_id);
create index idx_dispense_lot_id       on dispense_transactions(lot_id);
create index idx_dispense_dispense_date on dispense_transactions(dispense_date desc);

-- ─── Updated-at trigger ──────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_drugs_updated_at
  before update on drugs
  for each row execute procedure set_updated_at();

create trigger trg_lots_updated_at
  before update on lots
  for each row execute procedure set_updated_at();

-- ─── Row Level Security ──────────────────────────────────────
-- Single-user app: authenticated users have full access to all tables.

alter table drug_forms           enable row level security;
alter table suppliers            enable row level security;
alter table package_types        enable row level security;
alter table drugs                enable row level security;
alter table drug_barcodes        enable row level security;
alter table lots                 enable row level security;
alter table receive_transactions enable row level security;
alter table dispense_transactions enable row level security;

-- Authenticated read/write policy for every table
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'drug_forms','suppliers','package_types','drugs',
    'drug_barcodes','lots','receive_transactions','dispense_transactions'
  ] loop
    execute format(
      'create policy "auth_all" on %I for all to authenticated using (true) with check (true)',
      tbl
    );
  end loop;
end;
$$;

-- ─── Storage bucket for medicine images ──────────────────────
-- Run this manually in the Supabase dashboard or via the API:
-- Storage > New bucket > name: "medicine-images" > Public: true
