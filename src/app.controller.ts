import {
  Controller,
  Get,
  Post,
  Req,
  Query,
  Res,
  Body,
  HttpStatus,
  HttpException,
} from "@nestjs/common";
import { AppService } from "./app.service";
import { Request, Response } from "express";
import { generateNonce, SiweMessage } from "siwe";
import { SignedMessageDto } from "./signedMessageDto";
import { UserDataDto } from "./userDataDto";

declare module "express-session" {
  interface SessionData {
    nonce?: string;
    logged?: boolean;
  }
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("/axiosTest")
  async getAxiosTest() {
    return await this.appService.pushEncryptedB64ToIpfs("testing ipfs");
  }

  @Get("/testIpfsFetch")
  async getIpfsTest() {
    return await this.appService.getIpfsHashedFile(
      "QmdQ9NM3vsVZVfCgxEMDvexB3cpY7saNNf4314jQeJqNay",
    );
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
        request.session.logged = false;
        return response.status(HttpStatus.BAD_REQUEST).send("");
      }
      request.session.logged = true;
      return response.status(HttpStatus.OK).send("");
    } catch (_) {
      throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
  }

  @Post("/api/store")
  async storeUserData(
    @Req() request: Request,
    @Body() userDataDto: UserDataDto,
    @Res() response: Response,
  ): Promise<Response> {
    try {
      if (!request.session.logged) {
        throw new HttpException("You must login first", HttpStatus.FORBIDDEN);
      }
      console.log(userDataDto);
      await this.appService.saveEncryptedData(userDataDto);
      return response.status(HttpStatus.OK).send("");
    } catch (e) {
      throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
  }

  @Get("/api/retrieve?")
  async retrieveUserData(
    @Req() request: Request,
    @Query("nftId") nftId: string,
    @Res() response: Response,
  ): Promise<Response> {
    try {
      if (!request.session.logged) {
        throw new HttpException("You must login first", HttpStatus.FORBIDDEN);
      }
      const foundUserData = await this.appService.getUserData(nftId);
      return response.status(HttpStatus.OK).send(foundUserData);
    } catch (e) {
      throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
  }
}
