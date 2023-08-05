import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto, MessageResponseDto } from '../dto/message.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guards';

@ApiTags('message')
@Controller('message')
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    //　存在しないチャンネルIDを指定した場合、空の配列が返ってくる
    // parseIntに失敗すると、500エラーが帰ってきてしまう
    @Get(':channelId')
    @UseGuards(JwtAuthGuard)
    @ApiResponse({ status: 200, description: 'Successfully retrieved the messages.', type: [MessageResponseDto] })
    async getMessages(@Param('channelId') channelId: string) {
        const id = parseInt(channelId, 10);
        return await this.messageService.getChannelMessages(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiResponse({ status: 201, description: 'Successfully created the message.', type: MessageResponseDto })
    async createMessage(@Body() createMessageDto: CreateMessageDto) {
        return await this.messageService.createMessage(createMessageDto);
    }
}
