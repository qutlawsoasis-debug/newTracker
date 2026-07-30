CREATE TABLE IF NOT EXISTS public.app_logs (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT,
  method TEXT,
  endpoint TEXT,
  status_code INT,
  duration_ms INT,
  error_message TEXT,
  metadata JSONB
);
