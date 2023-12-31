import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMessageDto } from '../dto/message.dto';
import { ChannelService } from 'src/channel/channel.service';

@Injectable()

@Injectable()
export class MessageService {
    constructor(private prisma : PrismaService, private channelService: ChannelService) {}

    async getChannelMessages(channelId: number) {
        // channelIdのroomが存在するかを確認
        const channel = await this.prisma.channel.findUnique({
            where: {
                id: channelId
            }
        });
    
        if (!channel) {
            throw new Error(`Channel with ID ${channelId} does not exist.`);
        }
    
        return this.prisma.message.findMany({
            where: {
                channelId: channelId
            },
            include: {
                author: {
                    select: {
                        displayName: true
                    }
                }
            }
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
                channelId: createMessageDto.channelId,
                isInvitation: createMessageDto.isInvitation ?? false
            }
        });
    
        // Update the lastUpdated field of the corresponding channel
        await this.prisma.channel.update({
            where: { id: createMessageDto.channelId },
            data: { lastUpdated: new Date() }
        });
    
        return newMessage;
    }

    async acceptInvitation(messageId: number, username: string) {
        // Find user by username
        const user = await this.prisma.user.findUnique({
            where: {
                username: username
            }
        });
    
        // If user not found, throw an error
        if (!user) {
            throw new Error('User not found');
        }
    
        // Find message by id
        const message = await this.prisma.message.findUnique({
            where: {
                id: messageId
            }
        });
    
        // If message not found, throw an error
        if (!message) {
            throw new Error('Message not found');
        }
    
        // If the message is not an invitation, throw an error
        if (!message.isInvitation) {
            throw new Error('This is not an invitation');
        }
    
        // Add the user to the channel
        await this.prisma.message.update({
            where: { id: message.id },
            data: { isAccepted: true }
        });
    
        return message;
    }
}
