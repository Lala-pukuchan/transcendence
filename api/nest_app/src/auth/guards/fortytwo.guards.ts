import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// FortyTwoOauthGuardをPassportのAuthGuardクラス（ユーザーのログイン状態など指定条件をチェック）を拡張して生成
@Injectable()
export class FortyTwoOauthGuard extends AuthGuard('42') {

	async canActivate(context: ExecutionContext): Promise<any> {
		const activate = (await super.canActivate(context)) as boolean;
		console.log('activate: ', activate);
		const request = context.switchToHttp().getRequest();
		console.log('request: ', request);
		await super.logIn(request);
		return activate;
	}
}
