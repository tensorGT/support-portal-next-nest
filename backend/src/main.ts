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
