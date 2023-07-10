import { PassportSerializer } from '@nestjs/passport';
import { Injectable, Inject } from '@nestjs/common';
import { UserSession } from '../../dto/user.dto';
import { Done } from '../../utils/types'
import { AuthenticationProvider } from '../auth';

@Injectable()
export class SessionSerializer extends PassportSerializer{
	constructor(
		@Inject('AUTH_SERVICE')
		private readonly authService: AuthenticationProvider
	){
		super();
	}

	// セッションのシリアライズ
	serializeUser(user: UserSession, done: Done) {
		done(null, user);
	}

	// セッションのデシリアライズ
	async deserializeUser(user: UserSession, done: Done){
		const userDb = await this.authService.findUser(user.fortyTwoId);
		// ユーザーが存在する場合、エラーなしユーザー情報返却。存在しない場合、エラーなしユーザー情報NULLを返却。
		return userDb ? done(null, userDb) : done(null, null);
	}
}
