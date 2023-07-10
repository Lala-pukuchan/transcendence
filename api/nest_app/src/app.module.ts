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
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { AvatarController } from './avatar/avatar.controller';

@Module({
  imports: [
    ChatModule,
    AuthModule,
    // 認証用セッション登録
    PassportModule.register({ session: true })
  ],
  controllers: [AppController, UsersController, ChannelController, MessageController, AvatarController],
  providers: [AppService, UsersService, PrismaService, ChannelService, MessageService],
})
export class AppModule {}
