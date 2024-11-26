CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  customer_email VARCHAR(140) NOT NULL,
  subject VARCHAR(160) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending', 'resolved')),
  priority VARCHAR(16) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'urgent')),
  assigned_agent VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
