import { IsDateString, IsOptional } from "class-validator";

export class AvailabilityQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
