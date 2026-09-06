-- Shared mill kiosk board: one breakroom TV, many office phones.
-- Unowned on purpose — anyone on the mill network can update the display.

create table if not exists kiosk_state (
  id         text primary key,
  payload    text not null,
  updated_at bigint not null
);

create table if not exists kiosk_decks (
  id         text primary key,
  name       text not null,
  kind       text not null,
  enabled    boolean not null default true,
  created_at bigint not null,
  slides     text not null
);
