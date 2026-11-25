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
import { ApartmentsService } from "./apartments.service";
import { AvailabilityQueryDto } from "./dto/availability-query.dto";
import { CreateApartmentDto } from "./dto/create-apartment.dto";
import { CreateBlockDto } from "./dto/create-block.dto";
import { UpdateApartmentDto } from "./dto/update-apartment.dto";

@Controller("apartments")
export class ApartmentsController {
  constructor(private readonly apartments: ApartmentsService) {}

  @Get()
  list(@Query("active") active?: string) {
    return this.apartments.list(active === "true");
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.apartments.findOne(id);
  }

  @Get(":id/availability")
  availability(
    @Param("id") id: string,
    @Query() query: AvailabilityQueryDto,
  ) {
    return this.apartments.availability(id, query);
  }

  @UseGuards(AdminAuthGuard)
  @Post()
  create(@Body() dto: CreateApartmentDto) {
    return this.apartments.create(dto);
  }

  @UseGuards(AdminAuthGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateApartmentDto) {
    return this.apartments.update(id, dto);
  }

  @UseGuards(AdminAuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.apartments.remove(id);
  }

  @UseGuards(AdminAuthGuard)
  @Post(":id/blocks")
  createBlock(@Param("id") id: string, @Body() dto: CreateBlockDto) {
    return this.apartments.createBlock(id, dto);
  }

  @UseGuards(AdminAuthGuard)
  @Delete(":id/blocks/:blockId")
  deleteBlock(
    @Param("id") id: string,
    @Param("blockId") blockId: string,
  ) {
    return this.apartments.deleteBlock(id, blockId);
  }
}
