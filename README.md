_README.md is a work-in-progress. Please check back later for more updates._

<p align="center">

  <a href="https://isaaceditor.com">
    <img src="assets/isaac-logo.png" alt="Isaac Logo" width="100" height="100">
  
  <h3 align="center">Isaac</h3>
  <p align="center">
    The AI-native, open source research workspace. Accelerating science.

<p align="center">
<a href="https://console.algora.io/org/isaac/bounties?status=open"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fconsole.algora.io%2Fapi%2Fshields%2Fisaac%2Fbounties%3Fstatus%3Dopen" alt="Open Bounties"></a>
<a href="https://console.algora.io/org/isaac/bounties?status=completed"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fconsole.algora.io%2Fapi%2Fshields%2Fisaac%2Fbounties%3Fstatus%3Dcompleted" alt="Rewarded Bounties"></a>

<p align="center">
<a href="https://github.com/aietal/isaac/stargazers"><img src="https://img.shields.io/github/stars/aietal/isaac" alt="Github Stars"></a>
</a>
<a href="https://github.com/aietal/isaac/network/members"><img src="https://img.shields.io/github/forks/aietal/isaac" alt="Github Forks"></a>
<a href="https://github.com/aietal/isaac/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-AGPLv3-blue" alt="License">
</a>

<p align="center">
<a href="https://discord.gg/sJBSV4Fh5k"><img src="https://img.shields.io/discord/1085110924043616286?label=discord" alt="Discord"></a>

## Description

You've stumbled upon the most exciting thing since sliced bread in the world of research and AI. But guess what? Our README is playing catch up with our awesomeness. It's still a work-in-progress, just like the best of us.

We're on a mission to make Isaac the go-to tool for researchers, scientists, and knowledge workers - basically anyone who loves to blend coffee with groundbreaking ideas.

## Prerequisites

- Python 3.x
- Supabase Account

## Installation Steps Docker (Recommended)

1. Install the Supabase CLI following the instructions [here](https://supabase.com/docs/guides/cli/getting-started)

2. Setup Supabase locally and migrate database schema by running the following command

```bash
npx supabase start
```

3. Add the following environment variables to `api/.env.example`, `web/.env.example` and `web/Dockerfile`. The values can be found in the output of `npx supabase start` command.

| Variable Name            | Value              |
| ------------------------ | ------------------ |
| SUPABASE_KEY             | `anon key`         |
| NEXT_PUBLIC_SUPABASE_KEY | `anon key`         |
| SUPABASE_SERVICE_KEY     | `service role key` |

4. `npx supabase status` can be used to check the status of the local Supabase instance.

5. Fork the repo from [here](https://github.com/aietal/isaac/fork)

6. Clone the forked repo to your local machine

```bash
git clone https://github.com/aietal/isaac.git
```

7. Add the other required environment variables to `api/.env.example`, `web/.env.example` and `web/Dockerfile`

8. Start the `isaac-web` and `isaac-api` containers with compose and remove `-d` flag to see logs if needed

```bash
   docker-compose up -d
```

## Installation Steps (Manual)

1. Fork the repo from [here](https://github.com/aietal/isaac/fork)

2. Clone the forked repo to your local machine

```bash
git clone https://github.com/aietal/isaac.git
```

### Setting up the API

**Step 1: Go to api directory**

```bash
cd api
```

**Step 2: Create and activate Python virtual environment**

For Mac/Linux:

```bash
python3 -m venv env
source env/bin/activate
```

For Windows:

```bash
py -m venv env
.\env\Scripts\activate
```

**Step 3: Install dependencies**

```bash
pip3 install --no-cache-dir -r requirements.txt "unstructured[all-docs]==0.10.10" "psycopg2-binary"
```

**Step 4: Run api**

```bash
OPENAI_API_KEY=sk-... python3 -m uvicorn app.main:app --host 0.0.0.0 --port 5001 --reload
```

### Setting up the web app

#### Setting up Supabase

**Step 1: Set Up Your Supabase Account**

To use Isaac, you first need a Supabase account. If you don't have one, sign up at [Supabase](https://supabase.com/). After signing up, create a new project in your Supabase account.

**Step 2: Create Database Schema**

Once your project is set up, you'll need to create a specific database schema for Isaac to work correctly. To do this, go to the SQL editor in your Supabase project and run the following scripts:

```sql
create table projects (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp default now(),
  title text,
  updated_at timestamp default now(),
  userId uuid,
  description text,
  emoji text,
  sortingOrder smallint
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
  userId text,
  title text not null,
  id uuid default uuid_generate_v4() primary key,
  projectId uuid,
  updated_at timestamp default now()
);

create table isaac_messages (
  id bigint not null primary key,
  created_at timestamp default now(),
  userId uuid,
  projectId uuid,
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
  projectId uuid references projects (id),
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
  projectId uuid default uuid_generate_v4(),
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
  documentId text,
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
```

#### Runing the web app

1. Go to web directory

```bash
cd web
```

2. Create .env file

Please refer to the .env.example in the /web directory.

2. Install dependencies

```bash
npm install
```

3. Run the app

```bash
npm run dev
```

## Contributing to Isaac

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. Please read our [Code of Conduct](CODE_OF_CONDUCT.md) to get started.

## Community

Join our [Discord Community](https://discord.gg/sJBSV4Fh5k), if you're interested to make your mark in the annals of research tool history or not.

## License

Isaac is open-source under GNU Affero General Public License Version 3 [(AGPLv3)](https://github.com/aietal/isaac/blob/main/LICENSE)

---
