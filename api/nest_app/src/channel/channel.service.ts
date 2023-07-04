import { Injectable } from '@nestjs/common';
import { createChannelDto } from 'src/dto/channel.dto';
import { PrismaService } from '../prisma.service';
import { Channel } from '@prisma/client';

@Injectable()
export class ChannelService {
    constructor(private readonly prisma : PrismaService) {}

    async createChannel(data: createChannelDto): Promise<Channel> {
        const { name, owner, isDM, isPublic, password } = data;

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
                password: password,
                lastUpdated: new Date(),
            },
        });
    }
}
