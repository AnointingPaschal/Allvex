-- ============================================================================
-- ALLVEX ADVISOR CHAT SYSTEM
-- ============================================================================

create table if not exists advisor_chats (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references profiles(id) on delete cascade,
  vehicle_id uuid references vehicles(id) on delete set null,
  vehicle_label text,
  subject text not null default 'General enquiry',
  status text not null default 'open',  -- open | resolved
  assigned_to uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create table if not exists advisor_chat_messages (
  id uuid primary key default uuid_generate_v4(),
  chat_id uuid not null references advisor_chats(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  sender_role text not null,   -- 'customer' | 'advisor'
  message text not null,
  read_by_customer boolean not null default false,
  read_by_advisor boolean not null default false,
  created_at timestamptz not null default now()
);

create index advisor_chats_customer_idx on advisor_chats(customer_id);
create index advisor_chat_messages_chat_idx on advisor_chat_messages(chat_id);

-- RLS
alter table advisor_chats enable row level security;
alter table advisor_chat_messages enable row level security;

create policy "chat_customer_or_staff" on advisor_chats for all
  using (
    customer_id = auth.uid()
    or public.current_role() in ('admin', 'support')
  );

create policy "messages_via_chat" on advisor_chat_messages for all
  using (
    exists (
      select 1 from advisor_chats c where c.id = chat_id
      and (c.customer_id = auth.uid() or public.current_role() in ('admin', 'support'))
    )
  );

-- Enable Supabase Realtime on both tables
alter publication supabase_realtime add table advisor_chats;
alter publication supabase_realtime add table advisor_chat_messages;
