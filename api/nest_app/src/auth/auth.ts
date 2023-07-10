import { UserDetails } from '../utils/types';
import { UserSession } from '../dto/user.dto';

export interface AuthenticationProvider {
	validateUser(details: UserDetails);
	createUser(details: UserDetails);
	findUser(fortytwoId: string): Promise<UserSession | undefined>;
}
