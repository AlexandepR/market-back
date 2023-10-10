import { Injectable } from "@nestjs/common";
import { User, UserDocument } from "../domain/entities/users.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UserType } from "../../auth/types/auth.types";


@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<UserDocument>) {
  }
  async createUser(
    email: string,
    passwordHash: string
  ): Promise<UserDocument> {
    try {
      const createdAt = new Date().toISOString();
      const user = new this.UserModel({ email, createdAt, passwordHash });
      await user.save();
      return user;
    } catch (error) {
      throw new Error("Failed to create user");
    }
  }
  async findUserByEmail(email: string): Promise<UserDocument> {
    return this.UserModel
      .findOne({ email });
  }
  async findUserById(id: Types.ObjectId): Promise<UserType> {
    const user = await this.UserModel
      .findOne({ _id: id }) as UserDocument;;
    return {
        _id: user._id,
        email: user.email,
        created_at: user.created_at,
        passwordHash: user.passwordHash,
    }
  }
}