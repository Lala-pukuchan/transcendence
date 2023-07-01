import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

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