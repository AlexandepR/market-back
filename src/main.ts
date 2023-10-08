import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { addSettingsApp } from "./app.settings";
import { settingsEnv } from "./settings/settings";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  addSettingsApp(app)
  await app.listen(settingsEnv.PORT);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
