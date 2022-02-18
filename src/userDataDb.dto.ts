import { AccessControlConditions } from "./accessControlConditions.entity";

export class UserDataDbDto {
  readonly nftId: string;
  readonly encryptedFile: Buffer;
  readonly encryptedSymmetricKey: string;
  readonly accessControlConditions: AccessControlConditions;
}
