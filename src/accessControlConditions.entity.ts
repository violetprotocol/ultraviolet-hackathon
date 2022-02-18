import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class AccessControlConditions {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column({})
  contractAddress: string;

  @Column({})
  standardContractType: string;

  @Column({})
  chain: string;

  @Column({})
  method: string;

  @Column("text", { array: true })
  public parameters: string[];

  @Column()
  returnValueTestComparator: string;

  @Column()
  returnValueTestValue: string;
}
