import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('auth')
export class AuthController {

	// ログイン機能
	@Get('login')
	login() {
		return;
	}

	// Oauth2 Providerのリダイレクト先URL
	@Get('redirect')
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
