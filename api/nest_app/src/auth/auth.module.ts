import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FortyTwoOauthStrategy } from './strategies/fortytwo.strategy'

@Module({
  providers: [
    FortyTwoOauthStrategy,
    {
      provide: 'AUTH_SERVICE',
      useClass: AuthService
    }
  ],
  controllers: [AuthController]
})
export class AuthModule {}
