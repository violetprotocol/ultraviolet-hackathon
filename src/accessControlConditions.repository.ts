import { EntityRepository, Repository } from "typeorm";
import { ConflictException } from "@nestjs/common";
import { AccessControlConditions } from "./accessControlConditions.entity";
import { AccessControlConditionsDto } from "./accessControlConditions.dto";

@EntityRepository(AccessControlConditions)
export class AccessControlConditionsRepository extends Repository<AccessControlConditions> {
  createAccessControl = async (
    AccessControlConditionsDto: AccessControlConditionsDto,
  ) => {
    return await this.save(AccessControlConditionsDto).catch((err: any) => {
      throw new ConflictException(err);
    });
  };

  findOneById = async (id: string) => {
    return await this.findOneOrFail(id).catch();
  };
}
