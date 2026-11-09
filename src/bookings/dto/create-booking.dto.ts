import { BookingStatus } from "@prisma/client";
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from "class-validator";

export class CreateBookingDto {
  @IsUUID()
  apartmentId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @Matches(/^\+?[0-9]{8,15}$/, {
    message: "El teléfono debe tener entre 8 y 15 dígitos",
  })
  customerPhone!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
