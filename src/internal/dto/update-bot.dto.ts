import { IsBoolean } from "class-validator";

export class UpdateBotDto {
  @IsBoolean()
  botActive!: boolean;
}
