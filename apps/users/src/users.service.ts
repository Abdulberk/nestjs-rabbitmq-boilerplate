import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UsersRepository } from './users.repository';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { UserResponseDto } from './dto/user-response.dto';
import axios from 'axios';
import { NotFoundException } from '@nestjs/common';
import { User } from './schema/user.schema';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';

@Injectable()
export class UsersService {
  private isAvatarDownloaded: boolean = false;
  private downloadedAvatar: string = '';
  constructor(
    private readonly usersRepository: UsersRepository,
    @Inject('users') private readonly client: ClientProxy,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async createUser(createEntryDto: CreateEntryDto): Promise<CreateEntryDto> {
    try {
      const user = await this.usersRepository.create(createEntryDto);

      if (!user) {
        throw new BadRequestException('Error creating user');
      }

      const emailResponse = await this.sendEmailToUser(user.email);
      console.log(emailResponse);
      await lastValueFrom(this.client.emit('USER_CREATED', user));
      return user;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async sendEmailToUser(email: string): Promise<string> {
    return `Email sent to ${email}`;
  }

  async findUser(id: string): Promise<UserResponseDto> {
    try {
      const response = await axios.get(`https://reqres.in/api/users/${id}`);
      const userData = response.data.data;
      const user: UserResponseDto = {
        id: userData.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        avatar: userData.avatar,
      };
      return user;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new NotFoundException('User not found');
      } else {
        throw new Error('An error occurred while fetching user data');
      }
    }
  }

  async downloadAvatar(avatarUrl: string): Promise<string> {
    if (this.isAvatarDownloaded) {
      return this.downloadedAvatar;
    }

    const avatarResponse = await axios.get(avatarUrl, {
      responseType: 'arraybuffer',
    });
    const avatarData = Buffer.from(avatarResponse.data, 'binary');
    const base64Avatar = avatarData.toString('base64');

    this.isAvatarDownloaded = true;
    this.downloadedAvatar = base64Avatar;

    this.client.emit('USER_AVATAR_DOWNLOADED', base64Avatar);

    return base64Avatar;
  }

  async saveAvatarToFile(
    avatarData: Buffer,
    avatarPath: string,
  ): Promise<void> {
    fs.writeFileSync(avatarPath, avatarData, 'binary');
    this.client.emit('USER_AVATAR_SAVED', avatarPath);
  }

  async updateUserAvatar(
    user: User,
    avatarPath: string,
    avatarHash: string,
  ): Promise<void> {
    user.avatar = avatarPath;
    user.avatarHash = avatarHash;
    await this.usersRepository.updateOne({ _id: user._id }, user);
    this.client.emit('USER_AVATAR_UPDATED', user);
  }

  async getAvatar(userId: string, remoteId: string): Promise<string> {
    const user = await this.usersRepository.findOne({ _id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const response = await axios.get(`https://reqres.in/api/users/${remoteId}`);
    const avatarUrl = response.data.data.avatar;

    const base64Avatar = await this.downloadAvatar(avatarUrl);

    if (!user.avatarHash || !user.avatar) {
      const hash = crypto
        .createHash('sha256')
        .update(base64Avatar)
        .digest('hex');
      const avatarPath = path.join(__dirname, 'avatars', `${hash}.png`);

      await this.saveAvatarToFile(
        Buffer.from(base64Avatar, 'base64'),
        avatarPath,
      );

      await this.updateUserAvatar(user, avatarPath, hash);

      return base64Avatar;
    } else {
      return base64Avatar;
    }
  }

  async deleteAvatar(userId: string): Promise<string> {
    const user = await this.usersRepository.findOne({
      _id: userId,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      await fs.promises.unlink(user.avatar);
      user.avatar = '';
      user.avatarHash = '';
      await this.usersRepository.updateOne({ _id: user._id }, user);
      this.client.emit('USER_AVATAR_DELETED', user);
      return 'Avatar deleted';
    } catch (error) {
      throw new BadRequestException('Error deleting avatar');
    }
  }
}
