-- Non-destructive tables for Integration Pack v1.1
CREATE TABLE IF NOT EXISTS addon_jobs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       text,
  status        text NOT NULL DEFAULT 'queued', -- queued|running|passed|failed
  provider      text NOT NULL,                  -- leonardo|stability
  strength      numeric DEFAULT 0.4,
  prompt        text,
  init_url      text,
  result_url    text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  soft_deleted  boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS addon_assets (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id        uuid REFERENCES addon_jobs(id) ON DELETE CASCADE,
  kind          text NOT NULL,       -- original|refined|mockup|export
  url           text NOT NULL,
  meta          jsonb,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS addon_credits (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       text NOT NULL,
  balance       int NOT NULL DEFAULT 0,
  updated_at    timestamptz DEFAULT now()
);
