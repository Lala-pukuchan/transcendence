import { Strategy, Profile } from 'passport-42';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject } from '@nestjs/common';
import { AuthenticationProvider } from '../auth';
import { UserDetails } from 'src/utils/types';

// FortyTwoOauthStrategyをPassportStrategyクラスを拡張して生成
@Injectable()
export class FortyTwoOauthStrategy extends PassportStrategy(Strategy) {

	// 42 appに登録したクライアント情報を設定して、コンストラクト
	constructor(@Inject('AUTH_SERVICE') private readonly authService: AuthenticationProvider) {
		super({
			clientID: process.env.FORTY_TWO_ClIENT_ID,
			clientSecret: process.env.FORTY_TWO_CLIENT_SECRET,
			callbackURL: process.env.FORTY_TWO_CALL_BACK_URL,
			scope: ['public']
		});
	}

	// 検証済みユーザー情報を42Oauthから取得
	async validate(accessToken: string, refreshToken: string, profile: Profile) {
		const { username, discriminator, id: fortytwoId, avatar } = profile;
		console.log('user info: ', username, discriminator, fortytwoId, avatar);
		const details = { username, discriminator, fortytwoId, avatar };
		await this.authService.validateUser(details);
	}
}