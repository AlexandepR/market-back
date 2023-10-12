import { UserAuthClassModel } from "../../types/auth.types";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "../../../users/infrastructure/users.repository";
import { UnauthorizedException } from "@nestjs/common";
import { isCorrectPassword } from "../../../../utils/helpers";
import { JwtService } from "../jwt.service";


export class LoginAuthCommand {
  constructor(
    public dto: UserAuthClassModel
  ) {
  }
}

@CommandHandler(LoginAuthCommand)
export class LoginAuthUseCase implements ICommandHandler<LoginAuthCommand> {
  constructor(
    protected jwtService: JwtService,
    protected usersRepository: UsersRepository
  ) {
  }
  async execute(command: LoginAuthCommand) {
    const { email, password } = command.dto;
    const user = await this.usersRepository.findUserByEmail(email);
    console.log(user,'user find---');
      const isHash = await isCorrectPassword(password, user.passwordHash);
    if (!user || !isHash) throw new UnauthorizedException();
    const token = await this.jwtService.createJWT(user);
    const refreshToken = await this.jwtService.createRefreshToken(user);
    const refreshTokenCookie = `refreshToken=${refreshToken}; HttpOnly; Secure`;
    // const refreshTokenCookie = `refreshToken=${refreshToken}`;
    if (!token || !refreshToken || !refreshTokenCookie) throw new UnauthorizedException();
    return { refreshTokenCookie, token };
  }
}