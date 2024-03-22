import { AbstractSchema } from '@app/common';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
@Schema({ versionKey: false, timestamps: true })
export class User extends AbstractSchema {
  @Prop({ required: true })
  email: string;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  job: string;

  @Prop({ required: false, default: '' })
  avatar: string;

  @Prop({ required: false, default: '' })
  avatarHash: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
