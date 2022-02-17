import { SiweMessage } from "siwe";
import { AccessControlConditions } from "ui/lib/types";

export class UserDataDto {
  readonly signature: string;

  readonly encryptedFile: Buffer;
  readonly encryptedSymmetricKey: Buffer;
  readonly accessControlConditions: AccessControlConditions
}
