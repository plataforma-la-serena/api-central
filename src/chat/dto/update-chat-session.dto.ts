import { IsBoolean, IsOptional } from "class-validator";

export class UpdateChatSessionDto {
  @IsOptional()
  @IsBoolean()
  botActive?: boolean;

  @IsOptional()
  @IsBoolean()
  wantsReservation?: boolean;

  @IsOptional()
  @IsBoolean()
  wantsHuman?: boolean;
}
