import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { AdminAuthGuard } from "./admin-auth.guard";
import {
  ADMIN_COOKIE,
  AdminPayload,
  adminCookieOptions,
} from "./auth.constants";
import { AuthService } from "./auth.service";
import { CurrentAdmin } from "./current-admin.decorator";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.auth.login(dto.email, dto.password);
    response.cookie(ADMIN_COOKIE, result.token, adminCookieOptions());
    return result;
  }

  @Post("logout")
  @HttpCode(200)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(ADMIN_COOKIE, { path: "/" });
    return { ok: true };
  }

  @UseGuards(AdminAuthGuard)
  @Get("me")
  me(@CurrentAdmin() admin: AdminPayload | undefined) {
    return admin;
  }
}
