import { Module } from "@nestjs/common";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AuthController } from "./modules/auth/application/auth.controller";
import { RegistrationAuthUseCase } from "./modules/auth/application/use-cases/registration.use-case";
import { UsersRepository } from "./modules/users/infrastructure/users.repository";
import { CqrsModule } from "@nestjs/cqrs";
import { User, UserSchema } from "./modules/users/domain/entities/users.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { settingsEnv } from "./settings/settings";
import { LoginAuthUseCase } from "./modules/auth/application/use-cases/login.use-case";
import { JwtModule } from "@nestjs/jwt";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./guards/auth-guard/auth.guard";
import { JwtService } from "./modules/auth/application/jwt.service";


@Module({
  imports: [
    MongooseModule.forRoot(settingsEnv.MONGO_URL),
    MongooseModule.forFeature([{
      name: User.name, schema: UserSchema
    }]),
    JwtModule.register({
      global: true,
      secret: settingsEnv.JWT_SECRET,
      signOptions: { expiresIn: '10m' },
    }),
    ThrottlerModule.forRoot([
      {
        name: "short",
        ttl: 10000,
        limit: 5
      }
    ]),
    CqrsModule
  ],
  controllers: [ AuthController],
  providers: [
    JwtService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    UsersRepository, RegistrationAuthUseCase, LoginAuthUseCase]
})

export class AppModule {
}
