import { Injectable } from "@nestjs/common";
import { BookingStatus } from "@prisma/client";
import { nightsBetween } from "../common/dates";
import { PrismaService } from "../prisma/prisma.service";

interface ConfirmedBooking {
  startDate: Date;
  endDate: Date;
  apartment: { pricePerNight: number };
}

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const [counts, confirmed, upcoming] = await Promise.all([
      this.counts(),
      this.prisma.booking.findMany({
        where: { status: BookingStatus.CONFIRMED },
        include: { apartment: { select: { pricePerNight: true } } },
      }),
      this.upcoming(),
    ]);

    return {
      ...counts,
      confirmedRevenue: this.revenue(confirmed),
      upcoming,
    };
  }

  private async counts() {
    const [apartmentsActive, bookingsPending, bookingsConfirmed, sessionsTotal, sessionsPaused] =
      await Promise.all([
        this.prisma.apartment.count({ where: { isActive: true } }),
        this.prisma.booking.count({ where: { status: BookingStatus.PENDING } }),
        this.prisma.booking.count({ where: { status: BookingStatus.CONFIRMED } }),
        this.prisma.chatSession.count(),
        this.prisma.chatSession.count({ where: { botActive: false } }),
      ]);

    return {
      apartmentsActive,
      bookingsPending,
      bookingsConfirmed,
      sessionsTotal,
      sessionsPaused,
    };
  }

  private revenue(bookings: ConfirmedBooking[]): number {
    return bookings.reduce((total, booking) => {
      const nights = nightsBetween(booking.startDate, booking.endDate);
      return total + nights * booking.apartment.pricePerNight;
    }, 0);
  }

  private upcoming() {
    return this.prisma.booking.findMany({
      where: {
        startDate: { gte: new Date() },
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      },
      orderBy: { startDate: "asc" },
      take: 8,
      include: { apartment: { select: { id: true, title: true } } },
    });
  }
}
