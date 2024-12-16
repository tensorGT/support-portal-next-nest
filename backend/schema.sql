CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  customer_email VARCHAR(140) NOT NULL,
  subject VARCHAR(160) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending', 'resolved')),
  priority VARCHAR(16) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'urgent')),
  assigned_agent VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_role VARCHAR(20) NOT NULL CHECK (author_role IN ('customer', 'agent')),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_audit (
