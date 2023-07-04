import { Module } from '@nestjs/common';
import { AppController } from './app/app.controller';
import { AppService } from './app/app.service';
import { ChatModule } from './chat/chat.module';
import { UsersController } from './user/users.controller';
import { UsersService } from './user/users.service';
import { PrismaService } from './prisma.service';
import { ChannelController } from './channel/channel.controller';
import { ChannelService } from './channel/channel.service';
import { MessageController } from './message/message.controller';
import { MessageService } from './message/message.service';

@Module({
  imports: [ChatModule],
  controllers: [AppController, UsersController, ChannelController, MessageController],
  providers: [AppService, UsersService, PrismaService, ChannelService, MessageService],
})
export class AppModule {}
