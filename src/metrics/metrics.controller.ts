import { Controller, Get, UseGuards } from "@nestjs/common";
import { AdminAuthGuard } from "../auth/admin-auth.guard";
import { MetricsService } from "./metrics.service";

@UseGuards(AdminAuthGuard)
@Controller("metrics")
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  @Get()
  summary() {
    return this.metrics.summary();
  }
}
