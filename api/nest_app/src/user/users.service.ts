import { Injectable, ConflictException, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Prisma, User, Channel } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from '../dto/user.dto';
import { GetUsersInfoResponse } from '../dto/user.dto';

@Injectable()
export class UsersService {
    constructor(private readonly prisma : PrismaService) {}

    // 存在する名前で作ろうとした時のエラーハンドリングがうまくいっていない
    async createUser(data: CreateUserDto) {
       try {
           return this.prisma.user.create({
               data: {
                   username: data.username,
                   avatar: data.avatar || 'default.jpg',
                   fortyTwoId: data.fortyTwoId,
               },
           });
       } catch (error) {
           if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
               throw new ConflictException('A user with this username already exists.');
           } else {
               throw new InternalServerErrorException('Something went wrong.');
           }
       }
    }

    async getUsersInfo() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                username: true,
                wins: true,
                losses: true,
                ladderLevel: true
            },
        });
    }

    //usernameが存在しない時のエラーハンドリング未対応
    async getUserDetail(username: string) {
        return this.prisma.user.findUnique({
            where: {
                username: username,
            },
            include: {
                friends: true,
                matches: {
                    take: 5,
                    orderBy: {
                    createdAt: 'desc',
                    },
                },
        },
        });
    }

    async changeAvatar(userName: string, newAvatar: string): Promise<User> {
        const user = await this.prisma.user.update({
            where: { username: userName },
            data: { avatar: newAvatar },
        });
        return user;
    }

    async addFriend(userName: string, friendUsername: string): Promise<User> {
        const friend = await this.prisma.user.findUnique({ where: { username: friendUsername } });
        if (!friend) {
            throw new NotFoundException(`User with username ${friendUsername} not found.`);
        }
        const updatedUser = await this.prisma.user.update({
            where: { username: userName },
            data: { friends: { connect: { id: friend.id } } },
        });
        return updatedUser;
    }

    async blockUser(userId: string, blockedUserId: string): Promise<User> {
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { blockedUsers: { connect: { id: blockedUserId } } },
        });
        return updatedUser;
    }

    async joinChannel(username: string, channelId: number, password: string): Promise<User> {
        const channel = await this.prisma.channel.findUnique({ where: { id: channelId } });
        if (!channel) {
            throw new NotFoundException(`Channel with id ${channelId} not found.`);
        }
    
        // If the channel has a password, verify it.
        if (channel.password) {
            if (channel.password !== password) {
                throw new UnauthorizedException(`Invalid password for channel id ${channelId}.`);
            }
        }
    
        const updatedUser = await this.prisma.user.update({
            where: { username: username },
            data: { channels: { connect: { id: channelId } } },
        });
        return updatedUser;
    }

    async getUserChannels(username: string) {
        const user = await this.prisma.user.findUnique({
            where: { username: username },
            include: { 
                channels: true,
                createdChannels: true,
                adminChannels: true
            },
        });

        if (!user) {
            throw new NotFoundException(`User with username ${username} not found.`);
        }

        // Combine all channels arrays and remove duplicates
        const channels = [...user.channels, ...user.createdChannels, ...user.adminChannels];
        const uniqueChannels = Array.from(new Set(channels.map(channel => channel.id)))
            .map(id => channels.find(channel => channel.id === id));

        uniqueChannels.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());

        // Return only the necessary channel information
        return uniqueChannels.map(channel => ({
            id: channel.id,
            name: channel.name,
            isDM: channel.isDM,
            isPublic: channel.isPublic,
            isProtected: channel.isProtected,
            lastUpdated: channel.lastUpdated,
        }));
    }

    async getPublicChannelsNotInUser(username: string) {
      const user = await this.prisma.user.findUnique({
        where: { username: username },
        include: { 
          channels: true,
          createdChannels: true,
          adminChannels: true
        },
     });

      if (!user) {
          throw new NotFoundException(`User with username ${username} not found.`);
      }

      // Channels the user is a part of
      const joinedChannels = [...user.channels];

      // Public channels
      const publicChannels = await this.prisma.channel.findMany({
        where: {
          isPublic: true,
        },
      });

      const notJoinedPublicChannels = publicChannels.filter(publicChannel => 
        !joinedChannels.some(joinedChannel =>
            joinedChannel.id === publicChannel.id
        )
      );

      notJoinedPublicChannels.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());

      // Return only the necessary channel information
      return notJoinedPublicChannels.map(channel => ({
        id: channel.id,
        name: channel.name,
        isDM: channel.isDM,
        isPublic: channel.isPublic,
        isProtected: channel.isProtected,
        lastUpdated: channel.lastUpdated,
      }));
    }

    async findUserByUsername(username: string) {
        return this.prisma.user.findUnique({
          where: {
            username: username,
          },
        });
    }

    async updateUserDisplayName(userName: string, newDisplayName: string): Promise<User> {
        const user = await this.prisma.user.update({
            where: { username: userName },
            data: { displayName: newDisplayName },
        });
        return user;
    }

    async getOtherUsers(username: string): Promise<GetUsersInfoResponse[]> {
      // 全てのユーザーを取得します
      const allUsers = await this.prisma.user.findMany();
      
      // usernameのユーザーを取得します
      const currentUser = await this.prisma.user.findUnique({ where: { username }, include: { friends: true }});
      
      if (!currentUser) {
        throw new NotFoundException(`User with username ${username} not found`);
      }
  
      // フレンドとそうでないユーザーを分けます
      const friends = currentUser.friends.map(friend => friend.username);
      const sortedUsers = allUsers.sort((a, b) => {
        if (friends.includes(a.username) && !friends.includes(b.username)) return -1;
        if (!friends.includes(a.username) && friends.includes(b.username)) return 1;
        return 0;
      });
    
      // 自分自身を除く他のユーザー
      const otherUsers = sortedUsers.filter(user => user.username !== username);
  
      // レスポンスオブジェクトにマッピング
      return otherUsers.map(user => ({
        user_id: user.id,
        username: user.username,
        avatar: user.avatar,
        wins: user.wins,
        losses: user.losses,
        ladderLevel: user.ladderLevel,
      }));
    }
}
