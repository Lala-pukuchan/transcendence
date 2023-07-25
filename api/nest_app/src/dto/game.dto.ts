import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateGameDto {

	@ApiProperty({ description: 'The name of the user.'})
	@IsString()
	@IsNotEmpty()
	username: string;

}

export class ScoreDto {

	@ApiProperty({ description: 'The score of user1.' })
	@IsNotEmpty()
	score1: number;
  
	@ApiProperty({ description: 'The score of user2.' })
	@IsNotEmpty()
	score2: number;

}