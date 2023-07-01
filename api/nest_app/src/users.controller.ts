import { Controller, Get, Post, HttpStatus, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @ApiResponse({ status: HttpStatus.OK, type: CreateUserDto })
    createUser(@Body() createUserDto: CreateUserDto) {
      return this.usersService.createUser(createUserDto);
    }
}