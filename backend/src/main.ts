import { Body, Controller, ForbiddenException, Get, Headers, Module, Param, Patch, Post, Query } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { PrismaClient } from "@prisma/client";
import "reflect-metadata";

const prisma = new PrismaClient();

@Controller("tickets")
class TicketsController {
  @Get()
  async list(@Query("status") status?: string, @Query("priority") priority?: string) {
    return prisma.ticket.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  @Post()
  async create(@Body() body: { email: string; subject: string; priority?: string; message: string }) {
    return prisma.ticket.create({
      data: {
        customerEmail: body.email,
        subject: body.subject,
        priority: body.priority || "normal",
        messages: { create: { authorRole: "customer", body: body.message } },
        audits: { create: { event: "ticket_created" } },
      },
    });
  }

  @Post(":id/reply")
  async reply(@Param("id") id: string, @Body() body: { role: "customer" | "agent"; message: string }) {
    return prisma.ticketMessage.create({
      data: { ticketId: Number(id), authorRole: body.role, body: body.message },
    });
  }

  @Patch(":id/assign")
  async assign(
    @Param("id") id: string,
    @Headers("x-role") role: string,
    @Body() body: { agent: string; status?: string }
  ) {
    if (role !== "agent") throw new ForbiddenException("only agent can assign ticket");
    return prisma.ticket.update({
      where: { id: Number(id) },
      data: {
        assignedAgent: body.agent,
        ...(body.status ? { status: body.status } : {}),
        audits: { create: { event: `assigned to ${body.agent}` } },
      },
    });
  }
}

@Module({ controllers: [TicketsController] })
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  await app.listen(process.env.PORT || 4021);
}
bootstrap();
