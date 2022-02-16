import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as session from "express-session";

const PORT = process.env.port || 8080;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true, credentials: true });
  app.use(
    session({
      secret: "notSoSecret",
      resave: false,
      saveUninitialized: false,
    }),
  );
  await app.listen(PORT);
}
bootstrap();
