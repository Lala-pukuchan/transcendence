import { Injectable } from '@nestjs/common';
import { AuthenticationProvider } from './auth';
import { UserDetails } from 'src/utils/types';

@Injectable()
export class AuthService implements AuthenticationProvider {
	
	validateUser(details: UserDetails) {
		throw new Error('method not implemented');
	}
	
	createUser() {
		throw new Error('method not implemented');
	}

	findUser() {
		throw new Error('method not implemented');
	}

}
