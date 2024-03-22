import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { User } from './schema/user.schema';
import { Logger } from '@nestjs/common';

@Injectable()
export class UsersRepository extends AbstractRepository<User> {
  protected readonly logger = new Logger(UsersRepository.name);
  constructor(
    @InjectModel(User.name)
    protected readonly userModel: Model<User>,
  ) {
    super(userModel);
  }
}
