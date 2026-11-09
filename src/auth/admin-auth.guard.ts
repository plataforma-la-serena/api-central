import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import { ADMIN_COOKIE, AdminPayload } from "./auth.constants";

type AdminRequest = Request & { admin?: AdminPayload };

function bearerToken(header?: string): string | undefined {
  if (!header?.startsWith("Bearer ")) {
    return undefined;
  }
  return header.slice("Bearer ".length).trim() || undefined;
}

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AdminRequest>();
    const token =
      request.cookies?.[ADMIN_COOKIE] ?? bearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException("Sesión no iniciada");
    }

    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; email: string }>(
        token,
      );
      request.admin = { id: payload.sub, email: payload.email };
      return true;
    } catch {
      throw new UnauthorizedException("Sesión inválida o expirada");
    }
  }
}
