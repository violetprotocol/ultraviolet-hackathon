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

  @OneToOne((type) => AccessControlConditions)
  @JoinColumn()
  accessControlConditions: AccessControlConditions;
}
