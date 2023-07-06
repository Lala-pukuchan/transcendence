import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { FortyTwoOauthGuard } from './guards/fortytwo.guards';

@Controller('auth')
export class AuthController {

	// ログイン機能
	@Get('login')
	@UseGuards(FortyTwoOauthGuard)
	login() {
		return;
	}

	// Oauth2 Providerのリダイレクト先URL
	@Get('redirect')
	@UseGuards(FortyTwoOauthGuard)
	redirect(@Res() res:Response) {

		// アプリのトップにリダイレクトさせる
		res.redirect('http://localhost:5173/');
	}

	// ユーザーのログイン状態
	@Get('status')
	status() {}

	// ログアウト機能
	@Get('logout')
	logout() {}

}
