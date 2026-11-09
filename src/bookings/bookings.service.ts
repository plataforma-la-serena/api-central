import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { assertDateRange } from "../common/dates";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { QueryBookingsDto } from "./dto/query-bookings.dto";
import { UpdateBookingDto } from "./dto/update-booking.dto";

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  list(query: QueryBookingsDto) {
    return this.prisma.booking.findMany({
      where: query.status ? { status: query.status } : undefined,
      orderBy: { startDate: "asc" },
      include: {
        apartment: {
          select: { id: true, title: true, pricePerNight: true },
        },
      },
    });
  }

  async create(dto: CreateBookingDto) {
    const apartment = await this.prisma.apartment.findUnique({
      where: { id: dto.apartmentId },
    });
    if (!apartment) {
      throw new NotFoundException("Departamento no encontrado");
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    this.assertRange(startDate, endDate);
    await this.assertAvailable(dto.apartmentId, startDate, endDate);

    return this.prisma.booking.create({
      data: {
        apartmentId: dto.apartmentId,
        startDate,
        endDate,
        customerPhone: dto.customerPhone,
        notes: dto.notes,
        status: dto.status ?? "PENDING",
      },
    });
  }

  async update(id: string, dto: UpdateBookingDto) {
    const booking = await this.findBooking(id);
    const startDate = dto.startDate ? new Date(dto.startDate) : booking.startDate;
    const endDate = dto.endDate ? new Date(dto.endDate) : booking.endDate;
    this.assertRange(startDate, endDate);

    if (dto.startDate || dto.endDate) {
      await this.assertAvailable(booking.apartmentId, startDate, endDate, id);
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: dto.status, notes: dto.notes, startDate, endDate },
    });
  }

  async remove(id: string) {
    await this.findBooking(id);
    await this.prisma.booking.delete({ where: { id } });
    return { ok: true };
  }

  private async findBooking(id: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      throw new NotFoundException("Reserva no encontrada");
    }
    return booking;
  }

  private assertRange(startDate: Date, endDate: Date): void {
    try {
      assertDateRange(startDate, endDate);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  private async assertAvailable(
    apartmentId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string,
  ): Promise<void> {
    const overlap = await this.prisma.booking.findFirst({
      where: {
        apartmentId,
        id: excludeId ? { not: excludeId } : undefined,
        status: { in: ["PENDING", "CONFIRMED"] },
        startDate: { lt: endDate },
        endDate: { gt: startDate },
      },
      select: { id: true },
    });

    if (overlap) {
      throw new ConflictException(
        "El departamento no está disponible en esas fechas",
      );
    }
  }
}
