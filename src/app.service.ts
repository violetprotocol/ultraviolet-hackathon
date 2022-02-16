import { Injectable } from "@nestjs/common";
import { generateNonce } from "siwe";

@Injectable()
export class AppService {
  getHello(): string {
    return "Hello World!";
  }
}
