import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FortyTwoOauthStrategy } from './strategies/fortytwo.strategy'

@Module({
  providers: [AuthService, FortyTwoOauthStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
