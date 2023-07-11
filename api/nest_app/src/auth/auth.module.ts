import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FortyTwoOauthStrategy } from './strategies/fortytwo.strategy'
import { PrismaService } from '../prisma.service';
import { SessionSerializer } from './utils/Serializer';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    })
  ],
  providers: [
    FortyTwoOauthStrategy,
    {
      provide: 'AUTH_SERVICE',
      useClass: AuthService
    },
    PrismaService,
    SessionSerializer
  ],
  controllers: [AuthController]
})
export class AuthModule {}
