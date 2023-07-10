import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserSession } from '../../dto/user.dto';

@Injectable()
export class SessionSerializer extends PassportSerializer{
	constructor(){
		super();
	}

	// セッションのシリアライズ
	serializeUser(user: UserSession, done: (err: Error, user: UserSession) => void): void {
		done(null, user);
	}

	// セッションのデシリアライズ
	deserializeUser(){
		//const userDb;
		//done(null, userDb);
	}
}
