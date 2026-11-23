import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { AdminAuthGuard } from "./admin-auth.guard";
import {
  ADMIN_COOKIE,
  AdminPayload,
  adminCookieOptions,
} from "./auth.constants";
import { AuthService } from "./auth.service";
import { CurrentAdmin } from "./current-admin.decorator";
import { LoginDto } from "./dto/login.dto";

const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 10;
const loginAttempts = new Map<
  string,
  { count: number; resetAt: number }
>();

function registerAttempt(ip: string): void {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || record.resetAt <= now) {
    loginAttempts.set(ip, { count: 0, resetAt: now + LOGIN_WINDOW_MS });

    if (loginAttempts.size > 1000) {
      for (const [key, value] of loginAttempts) {
        if (value.resetAt <= now) {
          loginAttempts.delete(key);
        }
      }
    }
    return;
  }

  if (record.count >= LOGIN_MAX_ATTEMPTS) {
    throw new HttpException(
      "Demasiados intentos. Probá más tarde.",
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

function recordFailure(ip: string): void {
  const record = loginAttempts.get(ip);
  if (record) {
    record.count += 1;
  }
}

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const ip = request.ip ?? "desconocida";
    registerAttempt(ip);

    try {
      const result = await this.auth.login(dto.email, dto.password);
      loginAttempts.delete(ip);
      response.cookie(ADMIN_COOKIE, result.token, adminCookieOptions());
      return result;
    } catch (error) {
      recordFailure(ip);
      throw error;
    }
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
