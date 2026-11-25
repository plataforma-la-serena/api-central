import { randomBytes } from "node:crypto";
import { HttpStatus, UnauthorizedException } from "@nestjs/common";
import type { Response } from "express";
import { describe, expect, it, vi } from "vitest";
import type { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { ADMIN_COOKIE } from "./auth.constants";

function makeController(result: unknown) {
  const auth = {
    login: vi.fn().mockResolvedValue(result),
  };
  return { auth, controller: new AuthController(auth as unknown as AuthService) };
}

function request(ip: string) {
  return { ip } as never;
}

function response() {
  return { cookie: vi.fn(), clearCookie: vi.fn() };
}

function asResponse(res: ReturnType<typeof response>): Response {
  return res as unknown as Response;
}

// Credencial efímera: el repo no guarda contraseñas literales ni de prueba.
const dto = { email: "admin@laserena.local", password: randomBytes(12).toString("hex") };

describe("AuthController", () => {
  it("setea una cookie HttpOnly al iniciar sesión", async () => {
    const { controller } = makeController({ token: "jwt", admin: { id: "1" } });
    const res = response();

    await controller.login(dto, request("10.0.0.1"), asResponse(res));

    expect(res.cookie).toHaveBeenCalledWith(
      ADMIN_COOKIE,
      "jwt",
      expect.objectContaining({ httpOnly: true, sameSite: "lax", path: "/" }),
    );
  });

  it("rechaza credenciales inválidas sin filtrar el motivo", async () => {
    const auth = {
      login: vi
        .fn()
        .mockRejectedValue(new UnauthorizedException("Credenciales inválidas")),
    };
    const controller = new AuthController(auth as unknown as AuthService);

    await expect(
      controller.login(dto, request("10.0.0.2"), asResponse(response())),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("bloquea con 429 después de 10 intentos fallidos desde la misma IP", async () => {
    const auth = {
      login: vi.fn().mockRejectedValue(new UnauthorizedException()),
    };
    const controller = new AuthController(auth as unknown as AuthService);
    const ip = "10.0.0.3";

    for (let attempt = 0; attempt < 10; attempt += 1) {
      await expect(
        controller.login(dto, request(ip), asResponse(response())),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    }

    await expect(
      controller.login(dto, request(ip), asResponse(response())),
    ).rejects.toMatchObject({ status: HttpStatus.TOO_MANY_REQUESTS });
  });

  it("limpia la cookie al cerrar sesión", () => {
    const { controller } = makeController({});
    const res = response();

    controller.logout(asResponse(res));

    expect(res.clearCookie).toHaveBeenCalledWith(ADMIN_COOKIE, { path: "/" });
  });
});
