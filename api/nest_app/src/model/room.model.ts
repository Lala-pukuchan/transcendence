import { ApiProperty } from '@nestjs/swagger';

export class Room {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
}
