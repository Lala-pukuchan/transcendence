import { ApiProperty } from '@nestjs/swagger';

export class Room {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  // @ApiProperty()
  // room_type_1: string;
  // @ApiProperty()
  // room_type_2: string;
}
