import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SiweMessage } from "siwe";
import { SiweLoginDto } from "./siweLogin.dto";
import { SiweLoginRepository } from "./siweLogin.repository";

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(SiweLoginRepository)
    private readonly siweLoginRepository: SiweLoginRepository,
  ) {}

  async validateMessageSignature(
    receivedMessage: SiweMessage,
    signature: string,
    nonce: string,
  ): Promise<boolean> {
    try {
      const fields: SiweMessage = await receivedMessage.validate(signature);
      if (fields.nonce === nonce) {
        await this.saveSiweLogin(fields.address, fields.nonce);
        return true;
      }
      return false;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async saveSiweLogin(userAddress: string, userNonce: string) {
    const siweLoginDto: SiweLoginDto = {
      userAddress: userAddress,
      userNonce: userNonce,
    };
    return await this.siweLoginRepository.createSiweLogin(siweLoginDto);
  }

  getHello(): string {
    return "Hello World!";
  }
}
