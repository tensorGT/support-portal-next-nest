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
