import { AccessControlConditions } from "ui/lib/types";

export class UserDataDto {
  readonly nftId: string;
  readonly encryptedFile: string;
  readonly encryptedSymmetricKey: string;
  readonly accessControlConditions: AccessControlConditions;
}
