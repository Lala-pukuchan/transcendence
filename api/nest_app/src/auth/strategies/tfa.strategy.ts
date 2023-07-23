import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class Jwt2faStrategy extends PassportStrategy(Strategy, 'jwt-2fa') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secret',
    });
  }

  // 二要素認証の検証
  async validate(payload: any) {
    const user = await this.authService.findUserByName(payload.username);

	// 二要素認証無効ユーザーの場合
    if (!user.isEnabledTfa) {
      return user;
    }

	// 認証済みの情報を取得
    if (payload.isTwoFactorAuthenticated) {
      return user;
    }
  }
}
