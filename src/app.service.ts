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
        await this.saveSiweLogin(fields.address, fields.nonce);
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
    const accessControlConditionDto: AccessControlConditionsDto = {
      contractAddress: userDataDto.accessControlConditions.contractAddress,
      standardContractType:
        userDataDto.accessControlConditions.standardContractType,
      chain: userDataDto.accessControlConditions.chain,
      method: userDataDto.accessControlConditions.method,
      parameters: userDataDto.accessControlConditions.parameters,
      returnValueTestComparator:
        userDataDto.accessControlConditions.returnValueTest.value,
      returnValueTestValue:
        userDataDto.accessControlConditions.returnValueTest.comparator,
    };
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
      const savedAccessControlConditions =
        await this.saveAccessControlConditions(userDataDto);
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
