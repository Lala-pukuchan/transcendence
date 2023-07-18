import { Injectable } from '@nestjs/common';
import { createChannelDto } from 'src/dto/channel.dto';
import { PrismaService } from '../prisma.service';
import { Channel } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class ChannelService {
    constructor(private readonly prisma : PrismaService) {}

    async createChannel(data: createChannelDto): Promise<Channel> {
        const { name, owner, isDM, isPublic, isProtected, password } = data;

        return await this.prisma.channel.create({
            data: {
                name: name,
                owner: {
                    connect: {
                        username: owner,
                    },
                },
                users: {
                    connect: {
                        username: owner,
                    },
                },
                isDM: isDM,
                isPublic: isPublic,
                isProtected: isProtected,
                password: password,
                lastUpdated: new Date(),
            },
        });
    }

    async verifyChannelPassword(channelId: number, password: string) {
      const channel = await this.prisma.channel.findUnique({
        where: { id: channelId },
      });
    
      if (!channel) {
        throw new NotFoundException(`Channel with id ${channelId} not found.`);
      }
    
      const isPasswordValid = channel.password === password;
      return { isValid: isPasswordValid };
    }
}
