import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    mimeType: string,
    data: Uint8Array<ArrayBuffer>,
    sourceUrl?: string,
    cropData?: Record<string, number>,
  ) {
    const image = await this.prisma.apartmentImage.create({
      data: { mimeType, data, sourceUrl, cropData },
      select: { id: true },
    });

    return { id: image.id, url: `/media/${image.id}` };
  }

  find(id: string) {
    return this.prisma.apartmentImage.findUnique({
      where: { id },
      select: { mimeType: true, data: true },
    });
  }

  findSource(id: string) {
    return this.prisma.apartmentImage.findUnique({
      where: { id },
      select: { sourceUrl: true, cropData: true },
    });
  }
}
