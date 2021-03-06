import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SiweLogin } from "./siweLogin.entity";
import { SiweLoginRepository } from "./siweLogin.repository";
import { AccessControlConditionsRepository } from "./accessControlConditions.repository";
import { AccessControlConditions } from "./accessControlConditions.entity";
import { UserData } from "./userData.entity";
import { UserDataRepository } from "./userData.repository";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    TypeOrmModule.forFeature([SiweLogin, SiweLoginRepository]),
    TypeOrmModule.forFeature([
      AccessControlConditions,
      AccessControlConditionsRepository,
    ]),
    TypeOrmModule.forFeature([UserData, UserDataRepository]),
    HttpModule.register({
      timeout: 20000,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
