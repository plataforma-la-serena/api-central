import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApartmentsService } from "../apartments/apartments.service";
import { ServiceTokenGuard } from "../auth/service-token.guard";
import { ChatService } from "../chat/chat.service";
import { AppendMessageDto } from "../chat/dto/append-message.dto";
import { UpdateChatSessionDto } from "../chat/dto/update-chat-session.dto";

@UseGuards(ServiceTokenGuard)
@Controller("internal")
export class InternalController {
  constructor(
    private readonly apartments: ApartmentsService,
    private readonly chat: ChatService,
  ) {}

  @Get("context")
  context() {
    return this.apartments.context();
  }

  @Get("chat-sessions/:phone")
  session(@Param("phone") phone: string) {
    return this.chat.getSessionByPhone(phone);
  }

  @Post("chat-sessions/:phone/messages")
  append(@Param("phone") phone: string, @Body() dto: AppendMessageDto) {
    return this.chat.appendMessage(phone, dto.role, dto.content);
  }

  @Patch("chat-sessions/:phone/bot")
  bot(@Param("phone") phone: string, @Body() dto: UpdateChatSessionDto) {
    return this.chat.setBotActiveByPhone(phone, dto.botActive);
  }
}
