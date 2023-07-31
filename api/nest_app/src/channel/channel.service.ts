import { Injectable } from '@nestjs/common';
import { createChannelDto } from 'src/dto/channel.dto';
import { PrismaService } from '../prisma.service';
import { Channel } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from '../user/users.service';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChannelService {
    constructor(
      private readonly prisma : PrismaService,
    ) {}

    async createChannel(data: createChannelDto) {
      const { name, owner, isDM, isPublic, isProtected, password, dmUser } = data;
  
      //ownerが存在するか確認
      const user = await this.prisma.user.findUnique({
          where: { username: owner },
      });
      if (!user) {
          throw new NotFoundException(`User with username ${owner} not found.`);
      }
  
      //dmUserが存在するか確認
      let dmUserdetail;
      if (isDM) {
          dmUserdetail = await this.prisma.user.findUnique({
            where: { username: dmUser },
          });
          if (!dmUserdetail) {
              throw new NotFoundException(`User with username ${dmUser} not found.`);
          }
      }
  
      // If isDM is true, check if a DM room already exists
      if (isDM) {
        const existingDM = await this.prisma.channel.findFirst({
            where: {
                isDM: true,
                AND: [
                    {
                        users: {
                            some: { username: owner },
                        },
                    },
                    {
                        users: {
                            some: { username: dmUser },
                        },
                    },
                ],
            },
        });
  
          // If a DM room already exists, return it
          if (existingDM) {
              return existingDM;
          }
      }
  
      // Initialize users array with the owner
      let usersToConnect = [{username: owner}];
  
      // If dmUser is defined, add it to the users array
      if(dmUser) {
        usersToConnect.push({username: dmUser});
      }

      let passwordHash: string | null;
      if (isProtected && password) {
        passwordHash = await bcrypt.hash(password, 10); // 10 is the number of salt rounds
      }
      else {
        passwordHash = null;
      }

      const newChannel = await this.prisma.channel.create({
        data: {
          name: name,
          owner: {
            connect: {
              username: owner,
            },
          },
          users: {
            connect: usersToConnect,
          },
          admins: {
            connect: {
              username: owner,
            },
          },
          isDM: isDM,
          isPublic: isPublic,
          isProtected: isProtected,
          password: passwordHash,
          lastUpdated: new Date(),
        },
        select: { // selectを使ってpasswordを除外
          id: true,
          name: true,
          owner: true,
          isDM: true,
          isPublic: true,
          isProtected: true,
          password: false,
          // 他の必要なフィールドを選択
        },
      });
      return newChannel;
  }

    async verifyChannelPassword(channelId: number, password: string) {
      const channel = await this.prisma.channel.findUnique({
        where: { id: channelId },
      });
    
      if (!channel) {
        throw new NotFoundException(`Channel with id ${channelId} not found.`);
      }
    
      const isPasswordValid = await bcrypt.compare(password, channel.password);
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
      // Get all users
      const allUsers = await this.prisma.user.findMany({
        select: {
          id: true,
          username: true,
          wins: true,
          losses: true,
          ladderLevel: true,
        },
      });
    
      // Get users in the channel
      const channelUsers = await this.prisma.channel.findUnique({
        where: { id: channelId },
        select: {
          users: {
            select: {
              id: true,
            },
          },
          bannedUsers: {   //  Get banned users
            select: {
              id: true,
            },
          },
        },
      });
    
      if (!channelUsers) {
        throw new NotFoundException('Channel not found.');
      }
    
      // Filter out users who are in the channel or banned from the channel
      const notInChannelUsers = allUsers.filter(
        (user) => 
          !channelUsers.users.some((channelUser) => channelUser.id === user.id) &&
          !channelUsers.bannedUsers.some((bannedUser) => bannedUser.id === user.id)  // Exclude banned users
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

    async getUsersInChannelWithoutOwner(channelId: number) {
      const channel = await this.prisma.channel.findUnique({
        where: { id: channelId },
        include: {
          owner: true,
          users: true,
        },
      });
    
      if (!channel) {
        throw new NotFoundException(`Channel with ID ${channelId} not found`);
      }
    
      const owner = channel.owner;
      const users = channel.users.filter((user) => user.id !== owner.id);
    
      return users;
    }

    async removeUserFromChannel(channelId: number, username: string) {
      const channel = await this.prisma.channel.findUnique({
        where: { id: channelId },
        include: {
          owner: true,
          admins: true,
          users: true,
        },
      });
    
      if (!channel) {
        throw new NotFoundException(`Channel with ID ${channelId} not found`);
      }
    
      const user = channel.users.find((user) => user.username === username);
    
      if (!user) {
        throw new NotFoundException(`User with username ${username} not found in channel with ID ${channelId}`);
      }

      if (user === channel.owner) {
        throw new BadRequestException('Cannot remove owner from channel');
      }
    
      await this.prisma.channel.update({
        where: { id: channelId },
        data: {
          users: {
            disconnect: { id: user.id },
          },
        },
      });

      if (channel.admins.find((admin) => admin.username === username)) {
        await this.prisma.channel.update({
          where: { id: channelId },
          data: {
            admins: {
              disconnect: { id: user.id },
            },
          },
        });
      }
    }

    async changeChannelPassword(channelId: number, oldPassword: string, newPassword: string) {
      const channel = await this.prisma.channel.findUnique({
        where: { id: channelId },
      });

      if (!channel) {
        throw new NotFoundException(`Channel with ID ${channelId} not found`);
      }

      const isPasswordValid = await this.verifyChannelPassword(channelId, oldPassword);

      if (!isPasswordValid.isValid) {
        throw new BadRequestException('Invalid password');
      }

      const passwordHash = await bcrypt.hash(newPassword, 10); // 10 is the number of salt rounds

      await this.prisma.channel.update({
        where: { id: channelId },
        data: {
          password: passwordHash,
        },
      });
      return { success: true };
    }

    async unsetChannelPassword(channelId: number, password: string) {
      const channel = await this.prisma.channel.findUnique({
        where: { id: channelId },
      });

      if (!channel) {
        throw new NotFoundException(`Channel with ID ${channelId} not found`);
      }

      const isPasswordValid = await this.verifyChannelPassword(channelId, password);

      if (!isPasswordValid.isValid) {
        throw new BadRequestException('Invalid password');
      }

      await this.prisma.channel.update({
        where: { id: channelId },
        data: {
          password: null,
          isProtected: false,
        },
      });
      return { success: true };
    }

    async setChannelPassword(channelId: number, password: string) {
      const channel = await this.prisma.channel.findUnique({
        where: { id: channelId },
      });

      if (!channel) {
        throw new NotFoundException(`Channel with ID ${channelId} not found`);
      }

      if (!channel.isPublic) {
        throw new BadRequestException('Cannot set password on private channel');
      }

      const passwordHash = await bcrypt.hash(password, 10); // 10 is the number of salt rounds

      await this.prisma.channel.update({
        where: { id: channelId },
        data: {
          password: passwordHash,
          isProtected: true,
        },
      });
      return { success: true };
    }

    async getChannelInfo(channelId: number, username: string) {
      const channel = await this.prisma.channel.findUnique({
        where: { id: channelId },
        include: {
          owner: true,
          admins: true,
          users: true,
          mutes: true,
        },
      });

      if (!channel) {
        throw new NotFoundException(`Channel with ID ${channelId} not found`);
      }

      const user = channel.users.find((user) => user.username === username);

      if (!user) {
        throw new BadRequestException(`User with username ${username} not found in channel with ID ${channelId}`);
      }

      const isOwner = channel.owner.username === username;
      const isAdmin = channel.admins.some((admin) => admin.username === username);
      const isMuted = channel.mutes.some((mute) => mute.mutedUserId === user.id);

      return {
        isOwner: isOwner,
        isAdmin: isAdmin,
        isPublic: channel.isPublic,
        isProtected: channel.isProtected,
        isDM: channel.isDM,
        isMuted: isMuted,
      };
    }

    async getDmUser(channelId: number, username: string) {
      const channel = await this.prisma.channel.findUnique({
        where: { id: channelId },
        include: {
          users: true,
        },
      });

      if (!channel) {
        throw new NotFoundException(`Channel with ID ${channelId} not found`);
      }

      if (!channel.isDM) {
        throw new BadRequestException(`Channel with ID ${channelId} is not a DM`);
      }

      const user = channel.users.find((user) => user.username === username);
      const dmuser = channel.users.find((user) => user.username !== username);

      if (!user) {
        throw new BadRequestException(`User with username ${username} not found in channel with ID ${channelId}`);
      }

      if (!dmuser) {
        throw new BadRequestException(`DM user not found in channel with ID ${channelId}`);
      }


      return dmuser;
    }

    async changeOwner(channelId: number, username: string) {
      const channel = await this.prisma.channel.findUnique({
        where: { id: channelId },
        include: {
          owner: true,
          admins: true,
          users: true,
        },
      });

      if (!channel) {
        throw new NotFoundException(`Channel with ID ${channelId} not found`);
      }

      const user = channel.users.find((user) => user.username === username);

      if (!user) {
        throw new BadRequestException(`User with username ${username} not found in channel with ID ${channelId}`);
      }

      await this.prisma.channel.update({
        where: { id: channelId },
        data: {
          // ownerId: user.id,
          owner: {
            connect: { id: user.id },
          },
        },
      });
      return { success: true };
    }

    async deleteChannel(channelId: number) {
      const channel = await this.prisma.channel.findUnique({
        where: { id: channelId },
      });

      if (!channel) {
        throw new NotFoundException(`Channel with ID ${channelId} not found`);
      }

      await this.prisma.channel.delete({
        where: { id: channelId },
      });
      return { success: true };
    }

    async banUser(channelId: number, username: string) {
      const channel = await this.prisma.channel.findUnique({
        where: { id: channelId },
        include: {
          users: true,
        },
      });

      if (!channel) {
        throw new NotFoundException(`Channel with ID ${channelId} not found`);
      }

      const user = channel.users.find((user) => user.username === username);

      if (!user) {
        throw new BadRequestException(`User with username ${username} not found in channel with ID ${channelId}`);
      }

      await this.removeUserFromChannel(channelId, username);

      await this.prisma.channel.update({
        where: { id: channelId },
        data: {
          bannedUsers: {
            connect: { id: user.id },
          },
        },
      });
      return { success: true };
    }

    async isUserMuted(channelId: number, username: string) {
      const channel = await this.prisma.channel.findUnique({
        where: { id: channelId },
      });

      if (!channel) {
        throw new NotFoundException(`Channel with ID ${channelId} not found`);
      }

      const user = await this.prisma.user.findUnique({
        where: { username: username },
      });

      if (!user) {
        throw new NotFoundException(`User with username ${username} not found`);
      }

      // Retrieve the mute record
      const mute = await this.prisma.mute.findFirst({
        where: {
          channelId: channelId,
          mutedUserId: user.id,
          startedAt: {
            lt: new Date(), // Started before now
          },
        },
      });
    
      // If there is no mute record, return not muted
      if (!mute) {
        return { isMuted: false };
      }
    
      // Calculate the elapsed time since the mute started (in minutes)
      const elapsedMinutes = Math.floor(
        (new Date().getTime() - mute.startedAt.getTime()) / 1000 / 60
      );
    
      // Calculate remaining mute time
      const remainingMinutes = mute.duration - elapsedMinutes;
    
      // If the remaining time is less than or equal to 0, the user is no longer muted
      if (remainingMinutes <= 0) {
        // Delete the mute record
        await this.prisma.mute.delete({
          where: { id: mute.id }
        });
        return { isMuted: false };
      } else {
        // If there is remaining time, the user is still muted
        return { isMuted: true, remainingMinutes: remainingMinutes };
      }
    }
    
    async muteUser(channelId: number, username: string, duration: number) {
      const channel = await this.prisma.channel.findUnique({
        where: { id: channelId },
      });

      if (!channel) {
        throw new NotFoundException(`Channel with ID ${channelId} not found`);
      }

      const user = await this.prisma.user.findUnique({
        where: { username: username },
      });

      if (!user) {
        throw new NotFoundException(`User with username ${username} not found`);
      }

      // Check if the user is already muted
      const existingMute = await this.isUserMuted(channelId, username);


      if (existingMute.isMuted) {
          throw new BadRequestException(`User with username ${username} is already muted in channel with ID ${channelId}. wait ${existingMute.remainingMinutes} minutes`);
      }

      // Mute the user
      const newMute = await this.prisma.mute.create({
          data: {
              mutedUserId: user.id,
              channelId: channelId,
              duration: duration,
          },
      });

      return newMute;
      }
}
