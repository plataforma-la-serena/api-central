import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import type { PrismaService } from "../prisma/prisma.service";
import { ChatService } from "./chat.service";

const PHONE = "+5492615550000";

function uniqueConstraintError(): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "test",
  });
}

function serviceWith(prisma: unknown): ChatService {
  return new ChatService(prisma as PrismaService);
}

describe("ChatService.getSessionByPhone", () => {
  it("crea la sesión cuando el número es nuevo", async () => {
    const session = { id: "s1", phoneNumber: PHONE };
    const prisma = {
      chatSession: {
        upsert: vi.fn().mockResolvedValue(session),
        findUnique: vi.fn(),
      },
      chatMessage: { findMany: vi.fn().mockResolvedValue([]) },
    };

    const result = await serviceWith(prisma).getSessionByPhone(PHONE);

    expect(result.session).toBe(session);
    expect(prisma.chatSession.upsert).toHaveBeenCalledWith({
      where: { phoneNumber: PHONE },
      update: {},
      create: { phoneNumber: PHONE },
    });
  });

  it("reutiliza la sesión si dos mensajes compiten en el alta", async () => {
    const existing = { id: "s1", phoneNumber: PHONE };
    const prisma = {
      chatSession: {
        upsert: vi.fn().mockRejectedValue(uniqueConstraintError()),
        findUnique: vi.fn().mockResolvedValue(existing),
      },
      chatMessage: { findMany: vi.fn().mockResolvedValue([]) },
    };

    const result = await serviceWith(prisma).getSessionByPhone(PHONE);

    expect(result.session).toBe(existing);
    expect(prisma.chatSession.findUnique).toHaveBeenCalledWith({
      where: { phoneNumber: PHONE },
    });
  });

  it("propaga errores de base que no son de unicidad", async () => {
    const prisma = {
      chatSession: {
        upsert: vi.fn().mockRejectedValue(new Error("sin conexión")),
        findUnique: vi.fn(),
      },
      chatMessage: { findMany: vi.fn().mockResolvedValue([]) },
    };

    await expect(serviceWith(prisma).getSessionByPhone(PHONE)).rejects.toThrow(
      "sin conexión",
    );
    expect(prisma.chatSession.findUnique).not.toHaveBeenCalled();
  });
});
