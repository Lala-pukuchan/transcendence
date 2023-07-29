import { UserSession } from '../dto/user.dto';
import { User } from '@prisma/client';

export type UserDetails = {
	username: string;
	discriminator: string;
	fortytwoId: string;
	avatar: string;
}

export type Done = (err: Error, user: UserSession) => void;

export type ExtendedUser = {
	id: string;
	fortyTwoId: string;
	twoFactorSecret: string | null;
	isEnabledTfa: boolean;
	username: string;
	displayName: string | null;
	avatar: string | null;
	wins: number;
	losses: number;
	ladderLevel: number;
	friends: User[];
	notFriends: User[];
};
  