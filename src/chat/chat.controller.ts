import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AdminAuthGuard } from "../auth/admin-auth.guard";
import { ChatService } from "./chat.service";
import { OperatorMessageDto } from "./dto/operator-message.dto";
import { UpdateChatSessionDto } from "./dto/update-chat-session.dto";

@UseGuards(AdminAuthGuard)
@Controller("chat-sessions")
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Get()
  list() {
    return this.chat.listSessions();
  }

  @Get(":id/messages")
  messages(@Param("id") id: string) {
    return this.chat.getMessages(id);
  }

  @Post(":id/messages")
  appendOperator(
    @Param("id") id: string,
    @Body() dto: OperatorMessageDto,
  ) {
    return this.chat.appendOperatorMessage(id, dto.content);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateChatSessionDto) {
    return this.chat.setBotActive(id, dto.botActive);
  }
}
