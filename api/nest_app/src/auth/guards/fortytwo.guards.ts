import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// FortyTwoOauthGuardをPassportのAuthGuardクラス（ユーザーのログイン状態など指定条件をチェック）を拡張して生成
@Injectable()
export class FortyTwoOauthGuard extends AuthGuard('42') {

	async canActivate(context: ExecutionContext) {
		const activate = (await super.canActivate(context)) as boolean;
		const req = context.switchToHttp().getRequest();
		await super.logIn(req);
		return activate;
	}
}

// ユーザーが認証済みか判定
@Injectable()
export class AuthenticatedGuard implements CanActivate {

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		console.log('req.user: ', req.user);
		console.log('req.isAuthenticated: ', req.isAuthenticated());
		return req.isAuthenticated();
	}
}
