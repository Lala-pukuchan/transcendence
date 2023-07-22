import { Controller, Get, Post, Patch, HttpStatus, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, GetUsersInfoResponse, GetUserDetailResponse, GetChannelsResponse, DisplayNameClass } from '../dto/user.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

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
    
    @Post()
    @ApiResponse({ status: HttpStatus.OK, type: CreateUserDto })
    createUser(@Body() createUserDto: CreateUserDto) {
     return this.usersService.createUser(createUserDto);
    }

    @Patch(':username/friends')
    @ApiResponse({ status: HttpStatus.OK, type: GetUserDetailResponse, description: 'Add friend.'})
    addFriend(@Param('username') username: string, @Body('username') friend_username: string) {
        return this.usersService.addFriend(username, friend_username);
    }

    @Patch(':username/channels')
    @ApiResponse({ status: HttpStatus.OK, type: GetUserDetailResponse, description: 'Join a channel.'})
    joinChannel(
        @Param('username') username: string,
        @Body('channelId') channelId: number,
        @Body('password') password: string,
    ) {
        return this.usersService.joinChannel(username, channelId, password);
    }

    @Get(':username/channels')
    @ApiResponse({ status: HttpStatus.OK, type: [GetChannelsResponse], description: 'Get a list of channels the user is a part of.'})
    getUserChannels(@Param('username') username: string) {
        return this.usersService.getUserChannels(username);
    }

    @Patch(':username')
    @ApiResponse({ status: HttpStatus.OK, type: DisplayNameClass, description: 'Update users displayname.'})
    updateUser(
        @Param('username') username: string,
        @Body('displayName') displayName: string)
    {
        return this.usersService.updateUserDisplayName(username, displayName);
    }
}