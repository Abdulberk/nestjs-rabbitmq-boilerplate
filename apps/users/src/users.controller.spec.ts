import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { ConfigModule, DatabaseModule } from '@app/common';
import { User, UserSchema } from './schema/user.schema';
import { RmqModule } from '@app/common/rabbitmq/rabbitmq.module';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
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
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {},
        },
      ],
    }).compile();

    usersController = app.get<UsersController>(UsersController);
    usersService = app.get<UsersService>(UsersService);
  });

  describe('deleteAvatar', () => {
    it('should delete user avatar', async () => {
      const userId = 'exampleUserId';
      const spy = jest
        .spyOn(usersService, 'deleteAvatar')
        .mockResolvedValueOnce('avatar deleted');
      await usersController.deleteAvatar(userId);
      expect(spy).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'nonExistentUserId';
      jest
        .spyOn(usersService, 'deleteAvatar')
        .mockRejectedValueOnce(new NotFoundException());
      await expect(usersController.deleteAvatar(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAvatar', () => {
    it('should get user avatar', async () => {
      const userId = 'exampleUserId';
      const remoteId = 'exampleRemoteId';
      const spy = jest
        .spyOn(usersService, 'getAvatar')
        .mockResolvedValueOnce('base64Avatar');
      await usersController.findAvatar(userId, remoteId);
      expect(spy).toHaveBeenCalledWith(userId, remoteId);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'nonExistentUserId';
      const remoteId = 'exampleRemoteId';
      jest
        .spyOn(usersService, 'getAvatar')
        .mockRejectedValueOnce(new NotFoundException());
      await expect(
        usersController.findAvatar(userId, remoteId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should find user', async () => {
      const userData = {
        id: 1,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        avatar: 'https://example.com/avatar.png',
      };

      const spy = jest
        .spyOn(usersService, 'findUser')
        .mockResolvedValueOnce(userData);
      const userId = 'exampleUserId';

      const user = await usersController.findOne(userId);

      expect(spy).toHaveBeenCalledWith(userId);
      expect(user).toEqual(userData);
    });
  });

  describe('createUser', () => {
    it('should create user', async () => {
      const createUserDto = {
        name: 'exampleName',
        email: 'exampleEmail',
        job: 'exampleJob',
        avatar: 'exampleAvatar',
        avatarHash: 'exampleAvatarHash',
      };
      const spy = jest
        .spyOn(usersService, 'createUser')
        .mockResolvedValueOnce(createUserDto);
      await usersController.createUser(createUserDto);
      expect(spy).toHaveBeenCalledWith(createUserDto);
    });
  });
});
