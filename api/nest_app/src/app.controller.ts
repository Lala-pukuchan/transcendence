import { Controller, Get, Post, HttpStatus, Query, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponse } from '@nestjs/swagger';
import { GetRoomsResponse, GetRoomsRequest, GetUsersRequest } from './dto/room.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/rooms')
  @ApiResponse({ status: HttpStatus.OK, type: GetRoomsResponse })
  getRooms(@Query() { user_id, username }: GetUsersRequest): GetRoomsResponse {
    return { Rooms: [
		{ id: user_id, name: username},
		{ id: '2', name: 'DM_personA_personC'}] };
  }
}
