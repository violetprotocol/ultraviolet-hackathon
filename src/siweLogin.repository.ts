import { SiweLogin } from "./siweLogin.entity";
import { SiweLoginDto } from "./siweLogin.dto";
import { EntityRepository, Repository } from "typeorm";
import { ConflictException } from "@nestjs/common";

@EntityRepository(SiweLogin)
export class SiweLoginRepository extends Repository<SiweLogin> {
  createSiweLogin = async (SiweLoginDto: SiweLoginDto) => {
    return await this.save(SiweLoginDto).catch((err: any) => {
      throw new ConflictException(err);
    });
  };

  findOneLogin = async (id: string) => {
    return await this.findOneOrFail(id).catch();
  };

  findByAddress = async (userAddress: string) => {
    return await this.findOneOrFail({ where: { userAddress: userAddress } });
  };
}
