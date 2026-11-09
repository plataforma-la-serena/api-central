import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { addDays, assertDateRange, toIsoDate } from "../common/dates";
import { PrismaService } from "../prisma/prisma.service";
import { AvailabilityQueryDto } from "./dto/availability-query.dto";
import { CreateApartmentDto } from "./dto/create-apartment.dto";
import { CreateBlockDto } from "./dto/create-block.dto";
import { UpdateApartmentDto } from "./dto/update-apartment.dto";

const contextSelect = {
  id: true,
  title: true,
  description: true,
  pricePerNight: true,
  capacity: true,
  features: true,
} satisfies Prisma.ApartmentSelect;

@Injectable()
export class ApartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  list(activeOnly: boolean) {
    return this.prisma.apartment.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { createdAt: "asc" },
    });
  }

  async findOne(id: string) {
    const apartment = await this.prisma.apartment.findUnique({ where: { id } });
    if (!apartment) {
      throw new NotFoundException("Departamento no encontrado");
    }
    return apartment;
  }

  create(dto: CreateApartmentDto) {
    return this.prisma.apartment.create({ data: dto });
  }

  async update(id: string, dto: UpdateApartmentDto) {
    await this.findOne(id);
    return this.prisma.apartment.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.apartment.delete({ where: { id } });
    return { ok: true };
  }

  async availability(id: string, query: AvailabilityQueryDto) {
    await this.findOne(id);
    const from = query.from ? new Date(query.from) : new Date();
    const to = query.to ? new Date(query.to) : addDays(from, 120);
    const ranges = await this.findRanges(id, from, to);
    return { from: toIsoDate(from), to: toIsoDate(to), ranges };
  }

  async createBlock(id: string, dto: CreateBlockDto) {
    await this.findOne(id);
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    try {
      assertDateRange(startDate, endDate);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }

    return this.prisma.availabilityBlock.create({
      data: { apartmentId: id, startDate, endDate, reason: dto.reason },
    });
  }

  async deleteBlock(id: string, blockId: string) {
    const block = await this.prisma.availabilityBlock.findFirst({
      where: { id: blockId, apartmentId: id },
    });
    if (!block) {
      throw new NotFoundException("Bloqueo no encontrado");
    }
    await this.prisma.availabilityBlock.delete({ where: { id: blockId } });
    return { ok: true };
  }

  context() {
    return this.prisma.apartment.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
      select: contextSelect,
    });
  }

  private async findRanges(id: string, from: Date, to: Date) {
    const window = { startDate: { lt: to }, endDate: { gt: from } };
    const [bookings, blocks] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          apartmentId: id,
          status: { in: ["PENDING", "CONFIRMED"] },
          ...window,
        },
        orderBy: { startDate: "asc" },
      }),
      this.prisma.availabilityBlock.findMany({
        where: { apartmentId: id, ...window },
        orderBy: { startDate: "asc" },
      }),
    ]);

    return [
      ...bookings.map((booking) => ({
        type: "booking" as const,
        startDate: toIsoDate(booking.startDate),
        endDate: toIsoDate(booking.endDate),
        status: booking.status,
      })),
      ...blocks.map((block) => ({
        type: "block" as const,
        startDate: toIsoDate(block.startDate),
        endDate: toIsoDate(block.endDate),
        reason: block.reason,
      })),
    ];
  }
}
