import { Body, Controller, ForbiddenException, Get, Headers, Module, Param, Patch, Post, Query } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Pool } from "pg";
import "reflect-metadata";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/support_db",
});

@Controller("tickets")
class TicketsController {
  @Get()
  async list(@Query("status") status?: string, @Query("priority") priority?: string) {
    const conds: string[] = [];
    const vals: string[] = [];
    if (status) {
      vals.push(status);
      conds.push(`status = $${vals.length}`);
    }
    if (priority) {
      vals.push(priority);
      conds.push(`priority = $${vals.length}`);
    }
    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
    return (await pool.query(`SELECT * FROM tickets ${where} ORDER BY created_at DESC`, vals)).rows;
  }

  @Post()
  async create(@Body() body: { email: string; subject: string; priority?: string; message: string }) {
    const t = (
      await pool.query(
        "INSERT INTO tickets (customer_email, subject, priority) VALUES ($1, $2, $3) RETURNING *",
        [body.email, body.subject, body.priority || "normal"]
      )
    ).rows[0];
    await pool.query("INSERT INTO ticket_messages (ticket_id, author_role, body) VALUES ($1, 'customer', $2)", [
      t.id,
      body.message,
    ]);
    await pool.query("INSERT INTO ticket_audit (ticket_id, event) VALUES ($1, 'ticket_created')", [t.id]);
    return t;
  }

  @Post(":id/reply")
  async reply(@Param("id") id: string, @Body() body: { role: "customer" | "agent"; message: string }) {
    return (
      await pool.query(
        "INSERT INTO ticket_messages (ticket_id, author_role, body) VALUES ($1, $2, $3) RETURNING *",
        [Number(id), body.role, body.message]
      )
    ).rows[0];
  }

  @Patch(":id/assign")
  async assign(
    @Param("id") id: string,
    @Headers("x-role") role: string,
    @Body() body: { agent: string; status?: string }
  ) {
    if (role !== "agent") throw new ForbiddenException("only agent can assign ticket");
    const updated = (
      await pool.query("UPDATE tickets SET assigned_agent = $1, status = COALESCE($2, status) WHERE id = $3 RETURNING *", [
        body.agent,
        body.status || null,
        Number(id),
      ])
