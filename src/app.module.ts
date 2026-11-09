import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { ApartmentsModule } from "./apartments/apartments.module";
import { AuthModule } from "./auth/auth.module";
import { BookingsModule } from "./bookings/bookings.module";
import { ChatModule } from "./chat/chat.module";
import { InternalModule } from "./internal/internal.module";
import { MetricsModule } from "./metrics/metrics.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ApartmentsModule,
    BookingsModule,
    ChatModule,
    MetricsModule,
    InternalModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
