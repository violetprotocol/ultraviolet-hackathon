import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Body,
  HttpStatus,
  HttpException,
} from "@nestjs/common";
import { AppService } from "./app.service";
import { Request, Response } from "express";
import { generateNonce, SiweMessage } from "siwe";
import { SignedMessageDto } from "./signedMessageDto";

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

  @Post("/api/sign-in")
  async signUserMessage(
    @Req() request: Request,
    @Body() signedMessageDto: SignedMessageDto,
    @Res() response: Response,
  ): Promise<Response> {
    try {
      const receivedSiweMsg = new SiweMessage(signedMessageDto.siweMessage);
      const validated = await this.appService.validateMessageSignature(
        receivedSiweMsg,
        signedMessageDto.signature,
        request.session.nonce,
      );
      if (!validated) {
        console.log("not validated");
        return response.status(HttpStatus.BAD_REQUEST).send("");
      }
      return response.status(HttpStatus.OK).send("");
    } catch (_) {
      throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
  }
}
