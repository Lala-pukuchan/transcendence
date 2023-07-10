import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthenticatedGuard, FortyTwoOauthGuard } from './guards/fortytwo.guards';

@Controller('auth')
export class AuthController {

	// ログイン機能
	@Get('login')
	@UseGuards(FortyTwoOauthGuard)
	login() {
		return;
	}

	// Oauth2 Providerのリダイレクト先指定機能
	@Get('redirect')
	@UseGuards(FortyTwoOauthGuard)
	redirect(@Res() res:Response) {

		// アプリのトップにリダイレクトさせる
		res.redirect('http://localhost:5173/');
	}

	// ユーザーのログイン状態判定機能
	@Get('status')
	@UseGuards(AuthenticatedGuard)
	status() {
		return 'ok';
	}

	// ログアウト機能
	@Get('logout')
	logout() {}

}
