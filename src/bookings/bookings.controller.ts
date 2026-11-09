import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AdminAuthGuard } from "../auth/admin-auth.guard";
import { BookingsService } from "./bookings.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { QueryBookingsDto } from "./dto/query-bookings.dto";
import { UpdateBookingDto } from "./dto/update-booking.dto";

@UseGuards(AdminAuthGuard)
@Controller("bookings")
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get()
  list(@Query() query: QueryBookingsDto) {
    return this.bookings.list(query);
  }

  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookings.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateBookingDto) {
    return this.bookings.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.bookings.remove(id);
  }
}
