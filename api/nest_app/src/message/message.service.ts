import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMessageDto } from '../dto/message.dto';
import { ChannelService } from 'src/channel/channel.service';

@Injectable()

@Injectable()
export class MessageService {
    constructor(private prisma : PrismaService, private channelService: ChannelService) {}

    async getChannelMessages(channelId: number) {
        return this.prisma.message.findMany({
            where: {
                channelId: channelId
            },
        });
    }

    async createMessage(createMessageDto: CreateMessageDto) {
        // Find user by username
        const user = await this.prisma.user.findUnique({
            where: {
                username: createMessageDto.username
            }
        });
    
        // If user not found, throw an error
        if (!user) {
            throw new Error('User not found');
        }
    
        // Check if channel exists
        const channel = await this.prisma.channel.findUnique({
            where: {
                id: createMessageDto.channelId
            }
        });
    
        // If channel not found, throw an error
        if (!channel) {
            throw new Error('Channel not found');
        }
    
        // Check if the user is muted in this channel
        const muteStatus = await this.channelService.isUserMuted(createMessageDto.channelId, createMessageDto.username);
    
        // If the user is muted, throw an error
        if (muteStatus.isMuted) {
            throw new Error('User is muted in this channel');
        }
    
        // Create a new message
        const newMessage = await this.prisma.message.create({
            data: {
                content: createMessageDto.content,
                createdAt: createMessageDto.createdAt,
                username: user.username,
                channelId: createMessageDto.channelId
            }
        });
    
        // Update the lastUpdated field of the corresponding channel
        await this.prisma.channel.update({
            where: { id: createMessageDto.channelId },
            data: { lastUpdated: new Date() }
        });
    
        return newMessage;
    }
}
