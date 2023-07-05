import { Strategy, Profile } from 'passport-42';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

// 42PassportstrategyをPassportStrategyクラスを拡張して生成
@Injectable()
export class FortyTwoOauthStrategy extends PassportStrategy(Strategy) {

	// 42 appに登録したクライアント情報を設定して、コンストラクト
	constructor() {
		super({
			//clientID: process.env.UID,
			//clientSecret: process.env.SECRET,
			//callbackURL: process.env.IP_REDIRECT,
			//scope: ['public']
		});
	}

	// 検証済みユーザーを42 oauthから取得
	async validate(accessToken: string, refreshToken: string, profile: Profile) {
		const { username, discriminator, id, avatar } = profile;
		console.log('user info', username, discriminator, id, avatar);
	}
}