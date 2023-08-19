import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto, MessageResponseDto } from '../dto/message.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guards';
import { BadRequestException } from '@nestjs/common';

@ApiTags('message')
@UseGuards(JwtAuthGuard)
@Controller('message')
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    //　存在しないチャンネルIDを指定した場合、空の配列が返ってくる
    // parseIntに失敗すると、500エラーが帰ってきてしまう
    @Get(':channelId')
    @ApiResponse({ status: 200, description: 'Successfully retrieved the messages.', type: [MessageResponseDto] })
    async getMessages(@Param('channelId') channelId: string) {
        const id = parseInt(channelId, 10);
        return await this.messageService.getChannelMessages(id);
    }

    @Post()
    @ApiResponse({ status: 201, description: 'Successfully created the message.', type: MessageResponseDto })
    async createMessage(@Body() createMessageDto: CreateMessageDto) {
        return await this.messageService.createMessage(createMessageDto);
    }

    @Post(`/accept/:username`)
    @ApiResponse({ status: 201, description: 'Successfully accepted the invitation.'})
    async acceptInvitation(@Param('username') username: string, @Body('messageId') messageId: string) {
        const messageIdNumber = Number(messageId);

    if (isNaN(messageIdNumber)) {
      throw new BadRequestException(`Invalid message id. ${messageId}`);
    }
        return await this.messageService.acceptInvitation(messageIdNumber, username);
    }
}
