import { Injectable } from '@nestjs/common';
import { AuthenticationProvider } from './auth';
import { UserDetails } from 'src/utils/types';
import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';
import { UserSession } from '../dto/user.dto';

@Injectable()
export class AuthService implements AuthenticationProvider {

	// prismaを利用して、DBにアクセス
	constructor(private readonly prisma : PrismaService) {}

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
				fortyTwoId: details.fortytwoId,
				fortyTwoDiscriminator: "default_value"
			}
		});
		return newUser;
	}

	async findUser(fortyTwoId: string) : Promise<UserSession | undefined> {
		return this.prisma.user.findUnique({ where: { fortyTwoId: fortyTwoId } });
	}

}
