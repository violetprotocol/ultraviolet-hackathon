import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

const PORT = process.env.port || 8080;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true, credentials: true });
  await app.listen(PORT);
}
bootstrap();
