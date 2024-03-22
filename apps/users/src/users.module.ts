import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigModule } from '@app/common';
import { DatabaseModule } from '@app/common';
import { RmqModule } from '@app/common/rabbitmq/rabbitmq.module';
import { User, UserSchema } from './schema/user.schema';
import { UsersRepository } from './users.repository';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    DatabaseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    RmqModule.register({ name: 'users' }),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
