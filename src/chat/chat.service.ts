import { Injectable, NotFoundException } from "@nestjs/common";
import { MessageRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  listSessions() {
    return this.prisma.chatSession.findMany({
      orderBy: { lastInteraction: "desc" },
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
  }

  async getMessages(id: string) {
    const session = await this.findSession(id);
    const messages = await this.prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: "asc" },
    });
    return { session, messages };
  }

  async appendOperatorMessage(id: string, content: string) {
    const session = await this.findSession(id);
    const message = await this.prisma.chatMessage.create({
      data: { sessionId: session.id, role: MessageRole.OPERATOR, content },
    });
    await this.prisma.chatSession.update({
      where: { id: session.id },
      data: { lastInteraction: new Date() },
    });
    return message;
  }

  async setBotActive(id: string, botActive: boolean) {
    await this.findSession(id);
    return this.prisma.chatSession.update({
      where: { id },
      data: { botActive },
    });
  }

  async getSessionByPhone(phone: string) {
    const session = await this.ensureSession(phone);
    const messages = await this.prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    return { session, messages: messages.reverse() };
  }

  async appendMessage(phone: string, role: MessageRole, content: string) {
    const session = await this.ensureSession(phone);
    const message = await this.prisma.chatMessage.create({
      data: { sessionId: session.id, role, content },
    });
    await this.prisma.chatSession.update({
      where: { id: session.id },
      data: { lastInteraction: new Date() },
    });
    return message;
  }

  async setBotActiveByPhone(phone: string, botActive: boolean) {
    const session = await this.ensureSession(phone);
    return this.prisma.chatSession.update({
      where: { id: session.id },
      data: { botActive },
    });
  }

  private async ensureSession(phone: string) {
    return this.prisma.chatSession.upsert({
      where: { phoneNumber: phone },
      update: {},
      create: { phoneNumber: phone },
    });
  }

  private async findSession(id: string) {
    const session = await this.prisma.chatSession.findUnique({ where: { id } });
    if (!session) {
      throw new NotFoundException("Conversación no encontrada");
    }
    return session;
  }
}
