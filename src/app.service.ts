import { HttpException, Injectable, Param } from "@nestjs/common";
import { SiweMessage } from "siwe";

@Injectable()
export class AppService {
  async validateMessageSignature(
    receivedMessage: SiweMessage,
    signature: string,
    nonce: string,
  ): Promise<boolean> {
    try {
      const fields: SiweMessage = await receivedMessage.validate(signature);
      if (fields.nonce === nonce) {
        return true;
      }
      return false;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  getHello(): string {
    return "Hello World!";
  }
}
