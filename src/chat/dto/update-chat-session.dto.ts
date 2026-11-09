import { IsBoolean } from "class-validator";

export class UpdateChatSessionDto {
  @IsBoolean()
  botActive!: boolean;
}
