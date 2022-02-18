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
    return await this.findOne(id).catch();
  };
  //
  // findOneByNft = async (nftId: string) => {
  //   return await this.findOneOrFail({
  //     where: { nftId: nftId },
  //   })
  //     .leftJoinAndSelect(
  //       "user_data.access_control_conditions",
  //       "access_control_conditions",
  //     )
  //     .catch((err: any) => {
  //       console.log("notfoundException");
  //       throw new NotFoundException(err);
  //     });
  //   // const foundUserData = await this.createQueryBuilder("user_data")
  //   //   .leftJoinAndSelect("user_data.access_control_conditions", "access_control_conditions")
  //   //   .getResults();
  // };

  findOneUserDataByNftId = async (nftId: string) => {
    return await this.findOneOrFail({
      where: { nftId: nftId },
      relations: ["access_control_conditions"],
    }).catch((err: any) => {
      console.log("notfoundException");
      throw new NotFoundException(err);
    });
  };
}
