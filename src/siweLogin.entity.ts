import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class SiweLogin {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column({ length: 99, unique: true })
  userAddress: string;

  @Column()
  userNonce: string;
}
