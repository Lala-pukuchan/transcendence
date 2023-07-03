import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMessageDto } from '../dto/message.dto';

@Injectable()

@Injectable()
export class MessageService {
    constructor(private prisma : PrismaService) {}

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
    
        // Create a new message
        return this.prisma.message.create({
            data: {
                content: createMessageDto.content,
                createdAt: createMessageDto.createdAt,
                userId: user.id,
                channelId: createMessageDto.channelId
            }
        });
    }
}
