import { ConflictException, NotFoundException } from "@nestjs/common";
import { EntityRepository, Repository } from "typeorm";
import { UserData } from "./userData.entity";
import { UserDataDbDto } from "./userDataDb.dto";

@EntityRepository(UserData)
export class UserDataRepository extends Repository<UserData> {
  createUserData = async (UserDataDto: UserDataDbDto) => {
    return await this.save(UserDataDto).catch((err: any) => {
      throw new ConflictException(err);
    });
  };

  findOneUserDataById = async (id: string) => {
    return await this.findOneOrFail(id).catch();
  };

  findOneUserDataByNftId = async (nftId: string) => {
    return await this.findOneOrFail({ where: { nftId: nftId } }).catch(
      (err: any) => {
        throw new NotFoundException(err);
      },
    );
  };
}
