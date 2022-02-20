import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
} from "typeorm";
import { AccessControlConditions } from "./accessControlConditions.entity";

@Entity()
export class UserData {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column({ unique: true })
  nftId: string;

  @Column({ unique: true })
  encryptedSymmetricKey: string;

  @Column({})
  encryptedFile: string;

  @Column({ nullable: true })
  ipfsHash: string;

  @OneToOne((type) => AccessControlConditions)
  @JoinColumn({ name: "access_control_conditions" })
  access_control_conditions: AccessControlConditions;

  toJSON() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...other } = this;
    return other;
  }
}
