-- Drug barcodes table: maps manufacturer barcodes to drugs
create table if not exists drug_barcodes (
  id            bigserial primary key,
  barcode       text        not null unique,
  drug_id       bigint      not null references drugs(id) on delete cascade,
  note          text,
  created_at    timestamptz not null default now()
);

create index if not exists drug_barcodes_barcode_idx on drug_barcodes(barcode);

alter table drug_barcodes enable row level security;
create policy "auth users full access" on drug_barcodes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
