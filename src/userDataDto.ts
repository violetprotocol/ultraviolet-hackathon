import { AccessControlConditions } from "ui/lib/types";

export class UserDataDto {
  readonly signature: string;

  readonly encryptedFile: Buffer;
  readonly encryptedSymmetricKey: string;
  readonly accessControlConditions: AccessControlConditions;
}
