import { Room } from '../model/room.model';
import { ApiProperty } from '@nestjs/swagger';

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
