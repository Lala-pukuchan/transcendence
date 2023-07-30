import { Controller, Get, Post, Delete, Patch, Body } from '@nestjs/common';
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
  @ApiResponse({ status: 200, description: 'Successfully returned users not in channel' })
  async getUsersNotInChannel(@Param('channelId') channelId: string) {
    const channelIdNumber = Number(channelId);

    if (isNaN(channelIdNumber)) {
      throw new BadRequestException('Invalid channel ID.');
    }

    return this.channelService.getUsersNotInChannel(channelIdNumber);
  }

  @Get(':channelId/users/not-owners')
  @ApiResponse({ status: 200, description: 'Successfully returned users in channel without owner' })
  async getUsersInChannelWithoutOwner(@Param('channelId') channelId: string) {
    const channelIdNumber = Number(channelId);

    if (isNaN(channelIdNumber)) {
      throw new BadRequestException('Invalid channel ID.');
    }

    return this.channelService.getUsersInChannelWithoutOwner(channelIdNumber);
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

  @Delete(':channelId/users/:username')
  @ApiResponse({ status: 200, description: 'Successfully removed user from channel' })
  async removeUserFromChannel(@Param('channelId') channelId: string, @Param('username') username: string) {
    const channelIdNumber = Number(channelId);

    if (isNaN(channelIdNumber)) {
      throw new BadRequestException('Invalid channel ID.');
    }

    return this.channelService.removeUserFromChannel(channelIdNumber, username);
  }

  @Patch(':channelId/change-password')
  @ApiResponse({ status: 200, description: 'Successfully change channel password' })
  async changeChannelPassword(@Param('channelId') channelId: string, @Body('oldPassword') oldPassword: string, @Body('newPassword') newPassword: string) {
    const channelIdNumber = Number(channelId);

    if (isNaN(channelIdNumber)) {
      throw new BadRequestException('Invalid channel ID.');
    }

    return this.channelService.changeChannelPassword(channelIdNumber, oldPassword, newPassword);
  }

  @Patch(':channelId/unset-password')
  @ApiResponse({ status: 200, description: 'Successfully unset channel password' })
  async unsetChannelPassword(@Param('channelId') channelId: string, @Body('password') password: string) {
    const channelIdNumber = Number(channelId);

    if (isNaN(channelIdNumber)) {
      throw new BadRequestException('Invalid channel ID.');
    }

    return this.channelService.unsetChannelPassword(channelIdNumber, password);
  }

  @Patch(':channelId/set-password')
  @ApiResponse({ status: 200, description: 'Successfully set channel password' })
  async setChannelPassword(@Param('channelId') channelId: string, @Body('password') password: string) {
    const channelIdNumber = Number(channelId);

    if (isNaN(channelIdNumber)) {
      throw new BadRequestException('Invalid channel ID.');
    }
    return this.channelService.setChannelPassword(channelIdNumber, password);
  }

  @Get(':channelId/:username/info')
  @ApiResponse({ status: 200, description: 'Successfully returned channel info' })
  async getChannelInfo(@Param('channelId') channelId: string, @Param('username') username: string) {
    const channelIdNumber = Number(channelId);

    if (isNaN(channelIdNumber)) {
      throw new BadRequestException('Invalid channel ID.');
    }
    return this.channelService.getChannelInfo(channelIdNumber, username);
  }

  @Get(":channelId/users/:username/dm-user")
  @ApiResponse({ status: 200, description: 'Successfully returned dm user' })
  async getDmUser(@Param('channelId') channelId: string, @Param('username') username: string) {
    const channelIdNumber = Number(channelId);

    if (isNaN(channelIdNumber)) {
      throw new BadRequestException('Invalid channel ID.');
    }
    return this.channelService.getDmUser(channelIdNumber, username);
  }

  @Patch(":channelId/change-owner")
  @ApiResponse({ status: 200, description: 'Successfully changed owner' })
  async changeOwner(@Param('channelId') channelId: string, @Body('username') username: string) {
    const channelIdNumber = Number(channelId);

    if (isNaN(channelIdNumber)) {
      throw new BadRequestException('Invalid channel ID.');
    }
    return this.channelService.changeOwner(channelIdNumber, username);
  }

  @Delete(':channelId')
  @ApiResponse({ status: 200, description: 'Successfully deleted channel' })
  async deleteChannel(@Param('channelId') channelId: string) {
    const channelIdNumber = Number(channelId);

    if (isNaN(channelIdNumber)) {
      throw new BadRequestException('Invalid channel ID.');
    }
    
    return this.channelService.deleteChannel(channelIdNumber);
  }
}
