import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { BasicStrategy } from "passport-http";
import { settingsEnv } from "../../settings/settings";

@Injectable()
export class BasicAuthGuard extends PassportStrategy(BasicStrategy, 'basic') {
  constructor(
  ) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    });
  }

  async validate(username: string, password: string): Promise<any> {
    if (
      settingsEnv.BASIC_LOGIN === username &&
      settingsEnv.BASIC_PASS === password
    ) {
      return true;
    }
    throw new UnauthorizedException();
  }
}
