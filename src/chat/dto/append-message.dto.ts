import { MessageRole } from "@prisma/client";
import { IsEnum, IsString, MaxLength, MinLength } from "class-validator";

export class AppendMessageDto {
  @IsEnum(MessageRole)
  role!: MessageRole;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  content!: string;
}
