import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto, MessageResponseDto } from '../dto/message.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('message')
@Controller('message')
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    @Get(':channelId')
    @ApiResponse({ status: 200, description: 'Successfully retrieved the messages.', type: [MessageResponseDto] })
    async getMessages(@Param('channelId') channelId: number) {
        return await this.messageService.getChannelMessages(channelId);
    }

    @Post()
    @ApiResponse({ status: 201, description: 'Successfully created the message.', type: MessageResponseDto })
    async createMessage(@Body() createMessageDto: CreateMessageDto) {
        return await this.messageService.createMessage(createMessageDto);
    }
}
