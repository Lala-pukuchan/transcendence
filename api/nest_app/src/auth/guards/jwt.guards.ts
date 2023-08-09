import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {

	constructor (private readonly prisma : PrismaService, private jwtService: JwtService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {

		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);

		// jwtが無い場合、403エラーを返却
		if (!token) {
			throw new UnauthorizedException();
		}

		// jwt認証
		try {
			const payload = await this.jwtService.verifyAsync(
				token,
				{
					secret: process.env.JWT_SECRET
				}
			);
		
			//　JWTの内容から、DBの対象ユーザーを取得
			const user = await this.prisma.user.findUnique({ where: { username: payload.user.username } });
			if (!user)
				throw new UnauthorizedException();
			request['user'] = user;
		
		} catch {
			throw new UnauthorizedException();
		}

		return true;
	}

	// ヘッダーからjwt取得（-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vybm..."）
	private extractTokenFromHeader(request: Request): string | undefined {
		console.log('req: ', request.body);
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}
