import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PrismaService } from "../prisma/prisma.service";
import { BookingsService } from "./bookings.service";

function makePrisma() {
  return {
    apartment: { findUnique: vi.fn() },
    booking: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
}

function asPrisma(prisma: ReturnType<typeof makePrisma>): PrismaService {
  return prisma as unknown as PrismaService;
}

const dto = {
  apartmentId: "apt-1",
  startDate: "2026-12-20",
  endDate: "2026-12-23",
  customerPhone: "5492615555555",
};

describe("BookingsService", () => {
  let prisma: ReturnType<typeof makePrisma>;
  let service: BookingsService;

  beforeEach(() => {
    prisma = makePrisma();
    prisma.apartment.findUnique.mockResolvedValue({ id: "apt-1" });
    prisma.booking.findFirst.mockResolvedValue(null);
    prisma.booking.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: "bk-1", ...data }),
    );
    prisma.booking.update.mockImplementation(({ data }) =>
      Promise.resolve({ id: "bk-1", ...data }),
    );
    prisma.booking.delete.mockResolvedValue({ id: "bk-1" });
    service = new BookingsService(asPrisma(prisma));
  });

  it("lista sin filtro cuando no hay estado", async () => {
    prisma.booking.findMany.mockResolvedValue([]);
    await service.list({});
    expect(prisma.booking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined }),
    );
  });

  it("filtra por estado", async () => {
    prisma.booking.findMany.mockResolvedValue([]);
    await service.list({ status: "CONFIRMED" });
    expect(prisma.booking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: "CONFIRMED" } }),
    );
  });

  it("crea una reserva pendiente cuando hay disponibilidad", async () => {
    const created = await service.create(dto);
    expect(created).toMatchObject({ id: "bk-1", status: "PENDING" });
  });

  it("rechaza si el departamento no existe", async () => {
    prisma.apartment.findUnique.mockResolvedValue(null);
    await expect(service.create(dto)).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rechaza rangos inválidos", async () => {
    await expect(
      service.create({ ...dto, startDate: "2026-12-23", endDate: "2026-12-20" }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rechaza solapamientos con reservas activas", async () => {
    prisma.booking.findFirst.mockResolvedValue({ id: "bk-other" });
    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
  });

  it("excluye la propia reserva al validar solapamiento en update", async () => {
    prisma.booking.findUnique.mockResolvedValue({
      id: "bk-1",
      apartmentId: "apt-1",
      startDate: new Date(Date.UTC(2026, 11, 20)),
      endDate: new Date(Date.UTC(2026, 11, 23)),
    });

    await service.update("bk-1", { notes: "sin cambios de fecha" });

    expect(prisma.booking.findFirst).not.toHaveBeenCalled();
  });

  it("valida disponibilidad al cambiar fechas", async () => {
    prisma.booking.findUnique.mockResolvedValue({
      id: "bk-1",
      apartmentId: "apt-1",
      startDate: new Date(Date.UTC(2026, 11, 20)),
      endDate: new Date(Date.UTC(2026, 11, 23)),
    });

    await service.update("bk-1", { endDate: "2026-12-25" });

    expect(prisma.booking.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: { not: "bk-1" } }),
      }),
    );
  });

  it("rechaza actualizar una reserva inexistente", async () => {
    prisma.booking.findUnique.mockResolvedValue(null);
    await expect(service.update("missing", {})).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("elimina una reserva existente", async () => {
    prisma.booking.findUnique.mockResolvedValue({ id: "bk-1" });
    await expect(service.remove("bk-1")).resolves.toEqual({ ok: true });
  });
});
