import { Injectable } from '@nestjs/common';
import { AuthenticationProvider } from './auth';
import { UserDetails } from 'src/utils/types';
import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';
import { UserSession } from '../dto/user.dto';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService implements AuthenticationProvider {

	// prismaを利用して、DBにアクセス
	constructor(
		private readonly prisma : PrismaService,
		private readonly jwtService: JwtService
	) {}

	// ユーザー検証（ユーザーがDBに存在する場合は返却、しない場合は作成して返却）
	async validateUser(details: UserDetails): Promise<User> {
        const user = await this.prisma.user.findUnique({ where: { fortyTwoId: details.fortytwoId } });
		if (user) return user;
        return this.createUser(details);
    }
	
	// ユーザー作成
	async createUser(details: UserDetails) {
        console.log('created user : ', details.username, details.fortytwoId);
		const newUser = await this.prisma.user.create({
			data: {
				username: details.username,
				fortyTwoId: details.fortytwoId
			}
		});
		return newUser;
	}

	// ユーザー検索
	async findUser(fortyTwoId: string) : Promise<UserSession | undefined> {
		return this.prisma.user.findUnique({ where: { fortyTwoId: fortyTwoId } });
	}

	// ユーザー検索
	async findUserByName(username: string) : Promise<User | undefined> {
		return this.prisma.user.findUnique({ where: { username: username } });
	}

	// 二要素認証必要要素の生成
	async generateTwoFactorAuthenticationSecret(user: User) {

		// 二要素認証シークレット生成
		const secret = authenticator.generateSecret();
	
		// otp設定用URL作成
		const otpauthUrl = authenticator.keyuri(user.username, process.env.AUTH_APP_NAME, secret);
	
		// 二要素認証シークレットをDBに保存
		await this.prisma.user.update({
			where: { username: user.username },
			data: { twoFactorSecret: secret }
		});
	
		return {
		  secret,
		  otpauthUrl
		}
	}

	// QRコード生成
	async generateQrCodeDataURL(otpAuthUrl: string) {
		return toDataURL(otpAuthUrl);
	}

	// ユーザーの入力した二要素認証コードの検証
	isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: User) {
		return authenticator.verify({
		  token: twoFactorAuthenticationCode,
		  secret: user.twoFactorSecret,
		});
	}

	// ユーザーの二要素認証設定をONにする
    async turnOnTwoFactorAuthentication(username: string) {
        const user = await this.prisma.user.update({
            where: { username: username },
            data: { isEnabledTfa: true },
        });
    }

	// ユーザーの二要素認証設定をOFFにする
	async turnOffTwoFactorAuthentication(username: string) {
		const user = await this.prisma.user.update({
			where: { username: username },
			data: { isEnabledTfa: false, twoFactorSecret: null },
		});
	}

	// 二要素認証ログイン
	async loginWith2fa(userWithoutPsw: Partial<User>) {

		const payload = {
			user: userWithoutPsw,
			isEnabledTfa: !!userWithoutPsw.isEnabledTfa,
			isTwoFactorAuthenticated: true,
		};

		return {
			access_token: this.jwtService.sign(payload),
		};
	}
}
