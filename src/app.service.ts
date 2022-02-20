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
import { AccessControlConditions as AccessControlConditionsUiDto } from "ui/lib/types";
import { HttpService } from "@nestjs/axios";

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(SiweLoginRepository)
    private readonly siweLoginRepository: SiweLoginRepository,
    @InjectRepository(AccessControlConditionsRepository)
    private readonly accessControlConditionsRepository: AccessControlConditionsRepository,
    @InjectRepository(UserDataRepository)
    private readonly userDataRepository: UserDataRepository,
    private httpService: HttpService,
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

  async testAxios() {
    // return this.httpService.get("https://jsonplaceholder.typicode.com/todos/1").next();
    // return this.httpService
    //   .get("https://jsonplaceholder.typicode.com/todos/1")
    //   .pipe(map((response) => response.data));
    const response = await this.httpService
      .get("https://jsonplaceholder.typicode.com/todos/1")
      .toPromise();
    return response.data;
  }

  async pushEncryptedB64ToIpfs(base64File: string) {
    const response = await this.httpService
      .post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          pinataContent: {
            base64EncryptedFile: base64File,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PINATA_JWT}`,
            "Content-Type": "application/json",
          },
        },
      )
      .toPromise();
    return response.data["IpfsHash"];
  }

  async getIpfsHashedFile(ipfsHash: string) {
    console.log("getting ipfs hash");
    const response = await this.httpService
      .get(`https://ipfs.io/ipfs/${ipfsHash}`)
      .toPromise();
    if (response.data["base64EncryptedFile"]) {
      console.log("we got the data from ipfs wohoo");
    }
    return response.data["base64EncryptedFile"];
  }

  async getUserData(nftId: string) {
    try {
      const foundUserData =
        await this.userDataRepository.findOneUserDataByNftId(nftId);
      const ipfsEncryptedFile = await this.getIpfsHashedFile(
        foundUserData.ipfsHash,
      );
      if (ipfsEncryptedFile) {
        const userDataDto = this.transformUserDataIntoDto(
          foundUserData,
          ipfsEncryptedFile,
        );
        return userDataDto;
      }
      const userDataDto = this.transformUserDataIntoDto(foundUserData);
      return userDataDto;
    } catch (e) {
      console.log("didn't found nftId on user data table");
      throw e;
    }
  }

  transformUserDataIntoDto(userData: UserData, ipfsB64?: string): UserDataDto {
    const accessControlConditionsDto: AccessControlConditionsUiDto = {
      contractAddress: userData.access_control_conditions.contractAddress,
      standardContractType:
        userData.access_control_conditions.standardContractType,
      chain: userData.access_control_conditions.chain,
      method: userData.access_control_conditions.method,
      parameters: userData.access_control_conditions.parameters,
      returnValueTest: {
        comparator:
          userData.access_control_conditions.returnValueTestComparator,
        value: userData.access_control_conditions.returnValueTestValue,
      },
    };
    const userDataDto: UserDataDto = {
      nftId: userData.nftId,
      encryptedFile: ipfsB64 ? ipfsB64 : userData.encryptedFile,
      encryptedSymmetricKey: userData.encryptedSymmetricKey,
      accessControlConditions: [accessControlConditionsDto],
    };
    return userDataDto;
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
        userDataDto.accessControlConditions[0].returnValueTest.comparator,
      returnValueTestValue:
        userDataDto.accessControlConditions[0].returnValueTest.value,
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
    fileIpfsHash: string,
  ): Promise<UserData> {
    const userDataDtoToSave: UserDataDbDto = {
      nftId: userDataDto.nftId,
      encryptedFile: userDataDto.encryptedFile,
      encryptedSymmetricKey: userDataDto.encryptedSymmetricKey,
      access_control_conditions: accessControl,
      ipfsHash: fileIpfsHash,
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
      const fileIpfsHash = await this.pushEncryptedB64ToIpfs(
        userDataDto.encryptedFile,
      );
      const savedUserDataDto = await this.saveUserData(
        userDataDto,
        savedAccessControlConditions,
        fileIpfsHash,
      );
      console.log(
        `UserDataDto saved successfuly with id ${savedUserDataDto.id} and ipfsHash ${savedUserDataDto.ipfsHash}`,
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
function AxiosRequestConfig(): import("axios").AxiosRequestConfig<any> {
  throw new Error("Function not implemented.");
}
