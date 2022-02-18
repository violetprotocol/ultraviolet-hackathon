import { AccessControlConditions } from "ui/lib/types";

export class UserDataDto {
  readonly nftId: string;
  readonly encryptedFile: Buffer;
  readonly encryptedSymmetricKey: string;
  readonly accessControlConditions: AccessControlConditions;
}
