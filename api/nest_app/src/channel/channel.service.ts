import { Injectable } from '@nestjs/common';
import { createChannelDto } from 'src/dto/channel.dto';
import { PrismaService } from '../prisma.service';
import { Channel } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from '../user/users.service';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class ChannelService {
    constructor(
      private readonly prisma : PrismaService,
    ) {}

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
                admins: {
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

    async getUsersInChannel(channelId: number) {
      return this.prisma.channel.findUnique({
        where: { id: channelId },
        select: {
          users: {
            select: {
              id: true,
              username: true,
              wins: true,
              losses: true,
              ladderLevel: true,
            },
          },
        },
      });
    }

    async getUsersNotInChannel(channelId: number) {
      // すべてのユーザーを取得
      const allUsers = await this.prisma.user.findMany({
        select: {
          id: true,
          username: true,
          wins: true,
          losses: true,
          ladderLevel: true,
        },
      });
    
      // チャンネル内のユーザーを取得
      const channelUsers = await this.prisma.channel.findUnique({
        where: { id: channelId },
        select: {
          users: {
            select: {
              id: true,
            },
          },
        },
      });
    
      if (!channelUsers) {
        throw new NotFoundException('Channel not found.');
      }
    
      // チャンネルに参加していないユーザーをフィルタリング
      const notInChannelUsers = allUsers.filter(
        (user) => !channelUsers.users.some((channelUser) => channelUser.id === user.id)
      );
    
      return notInChannelUsers;
    }

    async addUserToChannel(channelId: number, username: string) {
      const user = await this.prisma.user.findUnique({ where: { username: username } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
    
      const channel = await this.prisma.channel.findUnique({ where: { id: channelId }, include: { users: true } });
      if (!channel) {
        throw new NotFoundException('Channel not found');
      }
    
      if (channel.users.find(u => u.username === username)) {
        throw new BadRequestException('User already in the channel');
      }
    
      await this.prisma.channel.update({
        where: { id: channelId },
        data: {
          users: {
            connect: { id: user.id },
          },
        },
      });
    }

    async addUserToAdmins(channelId: number, username: string) {
      const user = await this.prisma.user.findUnique({ where: { username: username } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
    
      const channel = await this.prisma.channel.findUnique({ where: { id: channelId }, include: { users: true } });
      if (!channel) {
        throw new NotFoundException('Channel not found');
      }
    
      if (!channel.users.find(u => u.username === username)) {
        throw new BadRequestException('User not in the channel');
      }

      await this.prisma.channel.update({
        where: { id: channelId },
        data: {
          admins: {
            connect: { id: user.id },
          },
        },
      });
    }

    async getNonAdminUsersInChannel(channelId: number) {
      const channel = await this.prisma.channel.findUnique({
        where: { id: channelId },
        include: {
          admins: true,
          users: true
        }
      })
  
      if (!channel) {
        throw new NotFoundException(`Channel with ID ${channelId} not found`);
      }
  
      const adminIds = new Set(channel.admins.map(admin => admin.id));
      const nonAdminUsers = channel.users.filter(user => !adminIds.has(user.id));
  
      return nonAdminUsers;
    }
}
