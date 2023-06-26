import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponse } from '@nestjs/swagger';
import { GetRoomsResponse, GetRoomsRequest } from './dto/room.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/rooms')
  @ApiResponse({ status: HttpStatus.OK, type: GetRoomsResponse })
  getRooms(@Query() { ids }: GetRoomsRequest): GetRoomsResponse {
    return { Rooms: [
		{ id: 1, name: 'DM_personA_personB'},
		{ id: 2, name: 'DM_personA_personC'}] };
  }
}
