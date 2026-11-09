import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { timingSafeEqual } from "node:crypto";
import type { Request } from "express";

function safeEqual(provided: string, expected: string): boolean {
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

@Injectable()
export class ServiceTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const expected = process.env.INTERNAL_API_TOKEN;
    const provided = request.headers["x-service-token"];

    if (!expected || typeof provided !== "string") {
      throw new UnauthorizedException("Token de servicio requerido");
    }

    if (!safeEqual(provided, expected)) {
      throw new UnauthorizedException("Token de servicio inválido");
    }

    return true;
  }
}
