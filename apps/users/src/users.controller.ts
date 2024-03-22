import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateEntryDto } from './dto/create-entry.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getHello(): string {
    return this.usersService.getHello();
  }

  @Post()
  createUser(@Body() createEntryDto: CreateEntryDto) {
    return this.usersService.createUser(createEntryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findUser(id);
  }

  @Get(':userId/avatar/:remoteUserId')
  findAvatar(
    @Param('userId') userId: string,
    @Param('remoteUserId') remoteUserId: string,
  ) {
    return this.usersService.getAvatar(userId, remoteUserId);
  }

  @Delete(':userId/avatar')
  deleteAvatar(@Param('userId') userId: string) {
    return this.usersService.deleteAvatar(userId);
  }
}
