import { Controller, Get, Post, Body } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { createChannelDto } from 'src/dto/channel.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { BadRequestException } from '@nestjs/common';
import { Param, HttpStatus } from '@nestjs/common';

@ApiTags('channel')
@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Post()
  @ApiResponse({ status: 200, type: createChannelDto })
  async createChannel(@Body() createChannelDto: createChannelDto) {
    return this.channelService.createChannel(createChannelDto);
  }

  @Post(':channelId/verifyPassword')
  @ApiResponse({ status: HttpStatus.OK, type: Boolean, description: 'Verify channel password.'})
  async verifyChannelPassword(@Param('channelId') channelId: string, @Body('password') password: string) {
    const channelIdNumber = Number(channelId);

    if (isNaN(channelIdNumber)) {
      throw new BadRequestException('Invalid channel ID.');
    }

    return this.channelService.verifyChannelPassword(channelIdNumber, password);
  }

  @Get(':channelId/users')
  async getUsersInChannel(@Param('channelId') channelId: string) {
    const channelIdNumber = Number(channelId);

    if (isNaN(channelIdNumber)) {
      throw new BadRequestException('Invalid channel ID.');
    }

    return this.channelService.getUsersInChannel(channelIdNumber);
  }

  @Get(':channelId/usersNotInChannel')
  async getUsersNotInChannel(@Param('channelId') channelId: string) {
    const channelIdNumber = Number(channelId);

    if (isNaN(channelIdNumber)) {
      throw new BadRequestException('Invalid channel ID.');
    }

    return this.channelService.getUsersNotInChannel(channelIdNumber);
  }

  @Post(':channelId/users')
  async addUserToChannel(@Param('channelId') channelId: string, @Body('username') username: string) {
    const channelIdNumber = Number(channelId);

    if (isNaN(channelIdNumber)) {
      throw new BadRequestException('Invalid channel ID.');
    }

    return this.channelService.addUserToChannel(channelIdNumber, username);
  }
}
