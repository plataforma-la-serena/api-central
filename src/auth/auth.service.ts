import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";

export interface AuthenticatedAdmin {
  id: string;
  email: string;
  createdAt: Date;
}

export interface LoginResult {
  token: string;
  admin: AuthenticatedAdmin;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string): Promise<LoginResult> {
    const admin = await this.prisma.admin.findUnique({ where: { email } });

    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      throw new UnauthorizedException("Credenciales inválidas");
    }

    const token = await this.jwt.signAsync({
      sub: admin.id,
      email: admin.email,
    });

    return {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        createdAt: admin.createdAt,
      },
    };
  }
}
