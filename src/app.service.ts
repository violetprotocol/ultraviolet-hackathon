import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SiweMessage } from "siwe";
import { AccessControlConditionsDto } from "./accessControlConditions.dto";
import { AccessControlConditions } from "./accessControlConditions.entity";
import { AccessControlConditionsRepository } from "./accessControlConditions.repository";
import { SiweLoginDto } from "./siweLogin.dto";
import { SiweLoginRepository } from "./siweLogin.repository";
import { UserData } from "./userData.entity";
import { UserDataRepository } from "./userData.repository";
import { UserDataDbDto } from "./userDataDb.dto";
import { UserDataDto } from "./userDataDto";

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(SiweLoginRepository)
    private readonly siweLoginRepository: SiweLoginRepository,
    @InjectRepository(AccessControlConditionsRepository)
    private readonly accessControlConditionsRepository: AccessControlConditionsRepository,
    @InjectRepository(UserDataRepository)
    private readonly userDataRepository: UserDataRepository,
  ) {}

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

  async getUserData(nftId: string) {
    try {
      const foundUserData = await this.userDataRepository.findOneUserDataById(
        nftId,
      );
      return foundUserData;
    } catch (e) {
      console.log("didn't found nftId on user data table");
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

  async saveAccessControlConditions(
    userDataDto: UserDataDto,
  ): Promise<AccessControlConditions> {
    console.log(userDataDto);
    const accessControlConditionDto: AccessControlConditionsDto = {
      contractAddress: userDataDto.accessControlConditions[0].contractAddress,
      standardContractType:
        userDataDto.accessControlConditions[0].standardContractType,
      chain: userDataDto.accessControlConditions[0].chain,
      method: userDataDto.accessControlConditions[0].method,
      parameters: userDataDto.accessControlConditions[0].parameters,
      returnValueTestComparator:
        userDataDto.accessControlConditions[0].returnValueTest.value,
      returnValueTestValue:
        userDataDto.accessControlConditions[0].returnValueTest.comparator,
    };
    console.log(accessControlConditionDto);
    const createdAccessControlConditions =
      await this.accessControlConditionsRepository.createAccessControl(
        accessControlConditionDto,
      );
    return createdAccessControlConditions;
  }

  async saveUserData(
    userDataDto: UserDataDto,
    accessControl: AccessControlConditions,
  ): Promise<UserData> {
    const userDataDtoToSave: UserDataDbDto = {
      nftId: userDataDto.nftId,
      encryptedFile: userDataDto.encryptedFile,
      encryptedSymmetricKey: userDataDto.encryptedSymmetricKey,
      accessControlConditions: accessControl,
    };
    const createdUserDataDto = await this.userDataRepository.createUserData(
      userDataDtoToSave,
    );
    return createdUserDataDto;
  }

  async saveEncryptedData(userDataDto: UserDataDto) {
    try {
      console.log("saveEncryptedData entered");
      const savedAccessControlConditions =
        await this.saveAccessControlConditions(userDataDto);
      console.log(savedAccessControlConditions);
      const savedUserDataDto = await this.saveUserData(
        userDataDto,
        savedAccessControlConditions,
      );
      console.log(
        "UserDataDto saved successfuly with id " + savedUserDataDto.id,
      );
      return savedUserDataDto;
    } catch (err) {
      console.log("Error saving on database");
      throw err;
    }
  }

  getHello(): string {
    return "Hello World!";
  }
}
