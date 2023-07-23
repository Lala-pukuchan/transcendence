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

  @Get(':channelId/users/not-members')
  async getUsersNotInChannel(@Param('channelId') channelId: string) {
    const channelIdNumber = Number(channelId);

    if (isNaN(channelIdNumber)) {
      throw new BadRequestException('Invalid channel ID.');
    }

    return this.channelService.getUsersNotInChannel(channelIdNumber);
  }

  @Post(':channelId/users')
  @ApiResponse({ status: 200, description: 'Successfully added user to channel' })
  async addUserToChannel(@Param('channelId') channelId: string, @Body('username') username: string) {
    const channelIdNumber = Number(channelId);

    if (isNaN(channelIdNumber)) {
      throw new BadRequestException('Invalid channel ID.');
    }

    return this.channelService.addUserToChannel(channelIdNumber, username);
  }

  @Post(':channelId/users/admins')
  @ApiResponse({ status: 200, description: 'Successfully returned admin users' })
  async addUserToAdmins(@Param('channelId') channelId: string, @Body('username') username: string) {
    const channelIdNumber = Number(channelId);

    if (isNaN(channelIdNumber)) {
      throw new BadRequestException('Invalid channel ID.');
    }

    return this.channelService.addUserToAdmins(channelIdNumber, username);
  }

  @Get(':channelId/users/members')
  @ApiResponse({ status: 200, description: 'Successfully returned non-admin users' })
  async getNonAdminUsersInChannel(@Param('channelId') channelId: string) {
    const channelIdNumber = Number(channelId);

    if (isNaN(channelIdNumber)) {
      throw new BadRequestException('Invalid channel ID.');
    }

    return this.channelService.getNonAdminUsersInChannel(channelIdNumber);
  }
}
