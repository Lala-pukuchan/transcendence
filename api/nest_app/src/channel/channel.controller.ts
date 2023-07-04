import { Controller, Post, Body } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { createChannelDto } from 'src/dto/channel.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('channel')
@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Post()
  @ApiResponse({ status: 200, type: createChannelDto })
  async createChannel(@Body() createChannelDto: createChannelDto) {
    return this.channelService.createChannel(createChannelDto);
  }
}
