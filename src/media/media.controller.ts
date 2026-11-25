import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { AdminAuthGuard } from "../auth/admin-auth.guard";
import { MediaService } from "./media.service";
import { UploadImageDto } from "./dto/upload-image.dto";
import { MAX_IMAGE_BYTES, looksLikeImage } from "./image-signature";

@Controller("media")
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @UseGuards(AdminAuthGuard)
  @Post()
  async upload(@Body() dto: UploadImageDto) {
    const data = new Uint8Array(Buffer.from(dto.dataBase64, "base64"));

    if (data.length === 0 || data.length > MAX_IMAGE_BYTES) {
      throw new BadRequestException("La imagen debe pesar menos de 5 MB");
    }

    if (!looksLikeImage(data, dto.mimeType)) {
      throw new BadRequestException("El archivo no es una imagen válida");
    }

    return this.media.create(
      dto.mimeType,
      data,
      dto.sourceUrl,
      dto.cropData,
    );
  }

  @Get(":id/source")
  async source(@Param("id") id: string) {
    const image = await this.media.findSource(id);

    if (!image) {
      throw new NotFoundException("Imagen no encontrada");
    }

    return {
      sourceUrl: image.sourceUrl ?? null,
      cropData: image.cropData ?? null,
    };
  }

  @Get(":id")
  async find(@Param("id") id: string, @Res() res: Response): Promise<void> {
    const image = await this.media.find(id);

    if (!image) {
      throw new NotFoundException("Imagen no encontrada");
    }

    res.setHeader("Content-Type", image.mimeType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.send(Buffer.from(image.data));
  }
}
