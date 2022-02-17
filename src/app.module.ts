import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SiweLogin } from "./siweLogin.entity";
import { SiweLoginRepository } from "./siweLogin.repository";

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    TypeOrmModule.forFeature([SiweLogin, SiweLoginRepository]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
