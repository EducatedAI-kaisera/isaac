create table projects (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp default now(),
  title text,
  updated_at timestamp default now(),
  "userId" uuid,
  description text,
  emoji text,
  "sortingOrder" smallint
);

create table chat_sessions (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp default now() not null,
  title text not null,
  updated_at timestamp default now(),
  type text not null,
  project_id uuid references projects (id)
);

create table documents (
  created_at timestamp default now(),
  text json,
  type text,
  "userId" text,
  title text not null,
  id uuid default uuid_generate_v4() primary key,
  "projectId" uuid,
  updated_at timestamp default now()
);

create table isaac_messages (
  id bigint not null primary key,
  created_at timestamp default now(),
  "userId" uuid,
  "projectId" uuid,
  type character,
  content jsonb,
  updated_at timestamp default now()
);

create table profile (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp default now(),
  is_subscribed boolean,
  interval text,
  stripe_customer text,
  email text,
  first_name text,
  last_name text,
  plan text,
  has_seen_tour boolean,
  expiration_date date default now(),
  updated_at timestamp default now(),
  has_seen_latest_update boolean,
  daily_free_token smallint,
  has_seen_community_banner boolean not null,
  custom_instructions jsonb,
  editor_language text not null
);

create table notes (
  id uuid default uuid_generate_v4() primary key,
  "projectId" uuid references projects (id),
  text json,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table "references" (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp default now(),
  title text,
  authors json,
  year text,
  doi text,
  "projectId" uuid default uuid_generate_v4(),
  tldr text,
  pdf text,
  updated_at timestamp default now(),
  type text,
  source text,
  sourceId text,
  url text,
  abstract text
);

create table comments (
  id uuid default uuid_generate_v4() primary key,
  quote text,
  type text,
  comments json[],
  "documentId" text,
  created_at timestamp default now() not null,
  updated_at timestamp default now()
);

CREATE TYPE upload_processing_status AS ENUM ('pending', 'processing', 'completed');

create extension vector with schema extensions;

create table uploads (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp default now(),
  user_id uuid default uuid_generate_v4(),
  status public.upload_processing_status not null,
  citation jsonb,
  project_id uuid references projects (id),
  file_name text,
  custom_citation jsonb,
  updated_at timestamp default now(),
  type text,
  abstract text,
  tldr text
);

create table chat_messages (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp default now() not null,
  content text,
  session_id uuid references chat_sessions (id),
  metadata jsonb,
  role text not null,
  note_id uuid references notes (id)
);

create table document_embeddings (
  id bigint not null primary key,
  content text,
  metadata jsonb,
  embedding extensions.vector(1536),
  upload_id uuid references uploads (id),
  searchable_content tsvector,
  updated_at timestamp default now()
);

create table user_integrations (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp default now() not null,
  zotero jsonb,
  mendeley jsonb
);
