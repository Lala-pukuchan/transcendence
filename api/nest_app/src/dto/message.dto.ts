import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, } from 'class-validator';

export class CreateMessageDto {
    @ApiProperty({ description: 'The name of the user.'})
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ description: 'The ID of the channel.'})
    @IsInt()
    @IsNotEmpty()
    channelId: number;

    @ApiProperty({ description: 'The content of the message.'})
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({ description: 'The time the message was created.'})
    @IsNotEmpty()
    createdAt: Date;
}

export class MessageResponseDto {
    @ApiProperty({ description: 'The ID of the message.'})
    @IsInt()
    @IsNotEmpty()
    id: number;

    @ApiProperty({ description: 'The content of the message.'})
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({ description: 'The time the message was created.'})
    @IsNotEmpty()
    createdAt: Date;

    @ApiProperty({ description : 'The ID of the user.'})
    userId: string;

    @ApiProperty({ description : 'The ID of the channel.'})
    @IsInt()
    @IsNotEmpty()
    channelId: number;
}