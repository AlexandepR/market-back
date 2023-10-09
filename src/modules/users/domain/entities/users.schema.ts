import { HydratedDocument } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  email: string;
  @Prop()
  created_at:string;

  @Prop({ default: "" })
  passwordHash: string;

  @Prop({ default: [] })
  expRefreshToken: string[]
}

export const UserSchema = SchemaFactory.createForClass(User);
