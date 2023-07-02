import { Controller, Get, Post, Patch, HttpStatus, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, GetUsersInfoResponse, GetUserDetailResponse } from './dto/user.dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @ApiResponse({ status: HttpStatus.OK, type: CreateUserDto })
    createUser(@Body() createUserDto: CreateUserDto) {
      return this.usersService.createUser(createUserDto);
    }

    @Get()
    @ApiResponse({ status: HttpStatus.OK, type: GetUsersInfoResponse})
    getUsersInfo(){
        return this.usersService.getUsersInfo();
    }

    @Get(':username')
    @ApiResponse({ status: HttpStatus.OK, type: GetUserDetailResponse, description: 'Get user detail. matches: 5 latest matches'})
    getUserDetail(@Param('username') username: string) {
        return this.usersService.getUserDetail(username);
    }

    @Patch(':username/avatar')
    @ApiResponse({ status: HttpStatus.OK, type: GetUserDetailResponse, description: 'Change user avatar.'})
    changeAvatar(@Param('username') username: string, @Body('avatar') newAvatar: string) {
        return this.usersService.changeAvatar(username, newAvatar);
    }

    @Patch(':username/friends')
    @ApiResponse({ status: HttpStatus.OK, type: GetUserDetailResponse, description: 'Add friend.'})
    addFriend(@Param('username') username: string, @Body('username') friend_username: string) {
        return this.usersService.addFriend(username, friend_username);
    }
}