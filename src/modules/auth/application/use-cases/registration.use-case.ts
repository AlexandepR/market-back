import { HttpException, HttpStatus } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RegistrationSuccessRes, UserAuthClassModel } from "../../types/auth.types";
import { UsersRepository } from "../../../users/infrastructure/users.repository";
import { generateHash, normalizeEmail } from "../../../../utils/helpers";

export class RegistrationAuthCommand {
  constructor(
    public dto: UserAuthClassModel
  ) {
  }
}

@CommandHandler(RegistrationAuthCommand)
export class RegistrationAuthUseCase implements ICommandHandler<RegistrationAuthCommand> {
  constructor(
    protected usersRepository: UsersRepository
  ) {
  }
  async execute(command: RegistrationAuthCommand):Promise<RegistrationSuccessRes> {
    const { email, password }: UserAuthClassModel = command.dto;
    const getEmail = normalizeEmail(email)
    const passwordHash = await generateHash(password);
    const findUserByEmail = await this.usersRepository.findUserByEmail(getEmail);
    if (findUserByEmail) throw new HttpException("User already exist", HttpStatus.BAD_REQUEST);
    const user = await this.usersRepository.createUser(getEmail, passwordHash);
    if (user) {
      return {
        message: "Registration successful",
        email: user.email,
        userId: user._id
      };
    }
    throw new HttpException("Failed to create user", HttpStatus.BAD_REQUEST);
  }
}