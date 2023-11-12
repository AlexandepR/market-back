import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { Throttle } from "@nestjs/throttler";
import { UserAuthClassModel } from "../types/auth.types";
import { RegistrationAuthCommand } from "./use-cases/registration.use-case";
import { LoginAuthCommand } from "./use-cases/login.use-case";
import { Public, RefreshTokenAuthGuard } from "../../../utils/public.decorator";
import { Request, Response } from "express";
import { RefreshTokenAuthCommand } from "./use-cases/refreshToken-auth-use-case";
import { settingsEnv } from "../../../settings/settings";
import * as cookie from "cookie";

@Controller("auth")
export class AuthController {
  constructor(
    private commandBus: CommandBus
  ) {
  }
  @Public()
  @Throttle({ default: { limit: 5, ttl: 10000 } })
  @HttpCode(HttpStatus.OK)
  @Post("/registration")
  async registration(
    @Body() dto: UserAuthClassModel
  ) {
    const command = new RegistrationAuthCommand(dto);
    return await this.commandBus.execute(command);
  }
  @Public()
  @Throttle({ default: { limit: 5, ttl: 10000 } })
  @HttpCode(HttpStatus.OK)
  @Post("/login")
  async login(
    @Res() response: Response,
    @Body() dto: UserAuthClassModel
  ) {
    const command = new LoginAuthCommand(dto);
    // return await this.commandBus.execute(command);
    const { refreshToken, token } = await this.commandBus.execute(command);
    console.log(refreshToken, "-----refreshTokenCookie");
    // response.setHeader("Set-Cookie", refreshTokenCookie);
    response.setHeader(
      "Set-Cookie",
      cookie.serialize("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "none",
      }));
    response.send({ email: dto.email, accessToken: token.token });
  }
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 10000 } })
  @RefreshTokenAuthGuard()
  @Post("/refresh-token")
  async refreshToken(
    @Res() response: Response,
    @Req() req: Request
  ) {
    console.log("/refresh-token------CASE Controlller");
    const command = new RefreshTokenAuthCommand(req);
    const { refreshTokenCookie, token } = await this.commandBus.execute(command);
    response.setHeader("Set-Cookie", refreshTokenCookie);
    response.send({ accessToken: token.token });
  }
  // @Throttle(5, 10)
  // @RefreshTokenAuthGuard()
  // @Post("/logout")
  // async logout(
  //   @Req() req: Request
  // ) {
  //   const command = new LogoutAuthCommand(req)
  //   return await this.commandBus.execute(command);
  // }
}
