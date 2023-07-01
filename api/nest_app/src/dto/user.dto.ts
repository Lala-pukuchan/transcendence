import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class FriendDetail {
    @ApiProperty({ description: 'The ID of the friend.'})
    @IsString()
    @IsNotEmpty()
    id: string;

    @ApiProperty({ description: 'The username of the friend.'})
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ description: 'The file path of the friend avatar.'})
    @IsOptional()
    @IsString()
    avatar: string;
}

export class MatchDetail {
    @ApiProperty({ description: 'The ID of the match.'})
    @IsInt()
    @IsNotEmpty()
    id: number;

    @ApiProperty({ description: 'The result of the match.'})
    @IsString()
    @IsNotEmpty()
    result: string;
}

export class CreateUserDto {
    @ApiProperty({ description: 'The name of the user.'})
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ description: 'The file path of the user avatar.'})
    @IsOptional()
    @IsString()
    avatar: string;
}

export class GetUsersInfoResponse {
    @ApiProperty({ description: 'The ID of the user.'})
    @IsString()
    @IsNotEmpty()
    user_id: string;

    @ApiProperty({ description: 'The name of the user.'})
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ description: 'The file path of the user avatar.'})
    @IsOptional()
    @IsString()
    avatar: string;

    @ApiProperty({ description: 'The number of wins of the user.'})
    @IsInt()
    @IsNotEmpty()
    wins: number;

    @ApiProperty({ description: 'The number of losses of the user.'})
    @IsInt()
    @IsNotEmpty()
    losses: number;

    @ApiProperty({ description: 'The ladder level of the user.'})
    @IsInt()
    @IsNotEmpty()
    ladderLevel: number;
}

export class GetUserDetailResponse {
    @ApiProperty({ description: 'The ID of the user.'})
    @IsString()
    @IsNotEmpty()
    user_id: string;

    @ApiProperty({ description: 'The name of the user.'})
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ description: 'The file path of the user avatar.'})
    @IsOptional()
    @IsString()
    avatar: string;

    @ApiProperty({ description: 'The number of wins of the user.'})
    @IsInt()
    @IsNotEmpty()
    wins: number;

    @ApiProperty({ description: 'The number of losses of the user.'})
    @IsInt()
    @IsNotEmpty()
    losses: number;

    @ApiProperty({ description: 'The ladder level of the user.'})
    @IsInt()
    @IsNotEmpty()
    ladderLevel: number;

    @ApiProperty({ description: 'The friends of the user.'})
    @IsOptional()
    friends: FriendDetail[];

    @ApiProperty({ description: 'The matches of the user.'})
    @IsOptional()
    matches: MatchDetail[];
}