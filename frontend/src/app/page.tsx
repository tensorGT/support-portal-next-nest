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
