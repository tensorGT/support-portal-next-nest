"use client";

import { useEffect, useState } from "react";

interface Ticket {
  id: number;
  subject: string;
  status: string;
  priority: string;
  assigned_agent: string | null;
}

export default function SupportPortal() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const q = status ? `?status=${status}` : "";
    fetch(`http://localhost:4021/tickets${q}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setTickets)
      .catch(() => {});
  }, [status]);

  return (
    <main style={{ maxWidth: 740, margin: "32px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h1>Support Ticketing Portal</h1>
      <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ marginBottom: 12 }}>
        <option value="">All statuses</option>
        <option value="open">open</option>
        <option value="pending">pending</option>
        <option value="resolved">resolved</option>
      </select>
      <ul>
        {tickets.map((t) => (
          <li key={t.id}>
            <strong>#{t.id} {t.subject}</strong> [{t.priority}] — {t.status} (agent: {t.assigned_agent || "unassigned"})
          </li>
        ))}
      </ul>
    </main>
  );
}
