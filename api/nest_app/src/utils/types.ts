import { UserSession } from '../dto/user.dto';

export type UserDetails = {
	username: string;
	discriminator: string;
	fortytwoId: string;
	avatar: string;
}

export type Done = (err: Error, user: UserSession) => void;
