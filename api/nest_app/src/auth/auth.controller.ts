import { Controller, Get, Res, Request, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthenticatedGuard, FortyTwoOauthGuard } from './guards/fortytwo.guards';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {

	constructor(private readonly jwtService: JwtService) {}

	// ログイン機能
	@Get('login')
	@UseGuards(FortyTwoOauthGuard)
	login() {
		return;
	}

	// Oauth2 Providerのリダイレクト先指定機能
	@Get('redirect')
	@UseGuards(FortyTwoOauthGuard)
	async redirect(@Request() req, @Res() res:Response) {

		// ユーザー情報を内包するJWTトークンをCookieに付与
		const payload = { username: req.session.passport.user.username };
		const token = await this.jwtService.signAsync(payload);
		res.cookie('token', token, { httpOnly: true });

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
