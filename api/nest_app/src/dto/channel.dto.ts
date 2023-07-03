import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { Room } from '../model/room.model';

export class createChannelDto {
    @ApiProperty({ description: 'The name of the channel.'})
    @IsInt()
    name: string;

    @ApiProperty({ description: 'The name of the owner.'})
    @IsString()
    @IsNotEmpty()
    owner: string;

    @ApiProperty({ description: 'flag indicating if the channel is a direct message channel.'})
    @IsBoolean()
    @IsOptional()
    isDM: boolean;

    @ApiProperty({ description: 'flag indicating if the channel is piblic.'})
    @IsBoolean()
    @IsOptional()
    isPublic: boolean;

    @ApiProperty({ description: 'The password of the channel.'})
    @IsString()
    @IsOptional()
    password: string;
}

export class GetRoomsResponse {
  @ApiProperty({ type: [Room] })
  Rooms: Room[];
}

export class GetRoomsRequest {
  @ApiProperty({ type: [Number] })
  ids: Room['id'][];
}

export class GetUsersRequest {
  user_id: string;
  username: string;
}
