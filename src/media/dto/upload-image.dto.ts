import { IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"] as const;

export class UploadImageDto {
  @IsIn(ALLOWED_IMAGE_TYPES)
  mimeType!: string;

  @IsString()
  @MinLength(4)
  @MaxLength(10_000_000)
  dataBase64!: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  sourceUrl?: string;
}
