import { Strategy, Profile } from 'passport-42';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

// 42PassportstrategyをPassportStrategyクラスを拡張して生成
@Injectable()
export class FortyTwoOauthStrategy extends PassportStrategy(Strategy) {

	// 42 appに登録したクライアント情報を設定して、コンストラクト
	constructor() {
		super({
			clientID: process.env.FORTY_TWO_ClIENT_ID,
			clientSecret: process.env.FORTY_TWO_CLIENT_SECRET,
			callbackURL: process.env.FORTY_TWO_CALL_BACK_URL,
			scope: ['public']
		});
	}

	// 検証済みユーザー情報を42Oauthから取得
	async validate(accessToken: string, refreshToken: string, profile: Profile) {
		const { username, discriminator, id, avatar } = profile;
		console.log('user info', username, discriminator, id, avatar);
	}
}