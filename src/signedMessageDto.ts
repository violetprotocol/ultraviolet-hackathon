import { SiweMessage } from "siwe";

export class SignedMessageDto {
  readonly signature: string;

  readonly siweMessage: SiweMessage;
}
