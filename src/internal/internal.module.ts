import { Module } from "@nestjs/common";
import { ApartmentsModule } from "../apartments/apartments.module";
import { ChatModule } from "../chat/chat.module";
import { InternalController } from "./internal.controller";

@Module({
  imports: [ApartmentsModule, ChatModule],
  controllers: [InternalController],
})
export class InternalModule {}
