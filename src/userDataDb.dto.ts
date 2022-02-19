import { AccessControlConditions } from "./accessControlConditions.entity";

export class UserDataDbDto {
  readonly nftId: string;
  readonly encryptedFile: string;
  readonly encryptedSymmetricKey: string;
  readonly access_control_conditions: AccessControlConditions;
}
