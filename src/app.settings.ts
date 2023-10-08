import { BadRequestException, INestApplication, ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { useContainer } from "class-validator";
import { HttpExceptionFilter } from "./exception.filter";
import * as cookieParser from 'cookie-parser';


export const addSettingsApp = (app: INestApplication) => {
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    stopAtFirstError: true,
    transform: true,
    exceptionFactory: (errors) => {
      const errorsForResponse = []
      errors.forEach((e) => {
        const constraintsKeys = Object.keys(e.constraints);
        constraintsKeys.forEach((key) => {
          errorsForResponse.push({
            message: e.constraints[key],
            field: e.property
          });
        });
      });
      throw new BadRequestException(errorsForResponse);
    }
  }));
  app.useGlobalFilters(new HttpExceptionFilter());
};
