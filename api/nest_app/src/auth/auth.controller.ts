import { Controller, Get, Post, Res, Request, UseGuards, Body, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { AuthenticatedGuard, FortyTwoOauthGuard } from './guards/fortytwo.guards';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt.guards';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

	constructor (
		private readonly jwtService: JwtService,
		private readonly authService: AuthService,
	) {}

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
		res.cookie('token', token, { httpOnly: false });

		// アプリのトップにリダイレクトさせる
		res.redirect(process.env.APP_URL);
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

	// JWTの対象ユーザー情報を返却する機能
	@UseGuards(JwtAuthGuard)
	@Get('profile')
	getProfile(@Request() req) {
	  return req.user;
	}

	// QRコード生成機能
	@Post('2fa/generate')
	@UseGuards(JwtAuthGuard)
	async register(@Request() req, @Res() res:Response) {
		const { otpauthUrl } = 
			await this.authService.generateTwoFactorAuthenticationSecret(
				req.user,
			);

		return res.json(
			await this.authService.generateQrCodeDataURL(otpauthUrl),
		);
	}

	// 二要素認証ON機能
	@Post('2fa/turn-on')
	@UseGuards(JwtAuthGuard)
	async turnOnTwoFactorAuthentication(@Request() req, @Body() body) {

		console.log('tfa');
		console.log('user', req.user);

		const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
			body.twoFactorAuthenticationCode,
			req.user,
		);
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		await this.authService.turnOnTwoFactorAuthentication(req.user.username);
	}

	@Post('2fa/authenticate')
	@UseGuards(JwtAuthGuard)
	async authenticate(@Request() req, @Body() body) {
		const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
			body.twoFactorAuthenticationCode,
			req.user,
		);

		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}

		return this.authService.loginWith2fa(req.user);
	}

}
