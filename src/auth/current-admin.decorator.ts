import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { AdminPayload } from "./auth.constants";

export const CurrentAdmin = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AdminPayload | undefined => {
    const request = context
      .switchToHttp()
      .getRequest<Request & { admin?: AdminPayload }>();
    return request.admin;
  },
);
