import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { AdminAuthGuard } from "./admin-auth.guard";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { ServiceTokenGuard } from "./service-token.guard";

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("JWT_SECRET"),
        signOptions: { expiresIn: "12h" },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AdminAuthGuard, ServiceTokenGuard],
  exports: [AdminAuthGuard, ServiceTokenGuard, JwtModule],
})
export class AuthModule {}
