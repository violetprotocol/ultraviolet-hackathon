import {
  Controller,
  Get,
  Req,
  Res,
  HttpStatus,
  HttpException,
} from "@nestjs/common";
import { AppService } from "./app.service";
import { Request, Response } from "express";
import { generateNonce } from "siwe";

declare module "express-session" {
  interface SessionData {
    nonce?: string;
  }
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("/nonce")
  async getSiweNonce(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<Response> {
    try {
      request.session.nonce = generateNonce();
      return response.status(HttpStatus.OK).send(request.session.nonce);
    } catch (_) {
      throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
  }
}
