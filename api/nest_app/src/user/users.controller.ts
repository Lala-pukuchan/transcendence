import { Controller, Get, Post, Patch, HttpStatus, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, GetUsersInfoResponse, GetUserDetailResponse, GetChannelsResponse, DisplayNameClass, UserNamesClass } from '../dto/user.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guards';

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
    @UseGuards(JwtAuthGuard)
    @ApiResponse({ status: HttpStatus.OK, type: GetUserDetailResponse, description: 'Get user detail. matches: 5 latest matches'})
    getUserDetail(@Param('username') username: string) {
        return this.usersService.getUserDetail(username);
    }
    
    @Post()
    @ApiResponse({ status: HttpStatus.OK, type: CreateUserDto })
    createUser(@Body() createUserDto: CreateUserDto) {
     return this.usersService.createUser(createUserDto);
    }

    @Patch(':username/addFriends')
    @UseGuards(JwtAuthGuard)
    @ApiResponse({ status: HttpStatus.OK, type: UserNamesClass, description: 'Add friend.'})
    addFriend(@Param('username') username: string, @Body() data: UserNamesClass) {
        return this.usersService.addFriend(username, data.usernames);
    }

    @Patch(':username/deleteFriends')
    @UseGuards(JwtAuthGuard)
    @ApiResponse({ status: HttpStatus.OK, type: UserNamesClass, description: 'Delete friend.'})
    deleteFriend(@Param('username') username: string, @Body() data: UserNamesClass) {
        return this.usersService.removeFriend(username, data.usernames);
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

    @Get(':username/channels/not-members')
    @ApiResponse({ status: HttpStatus.OK, type: [GetChannelsResponse], description: 'Get a list of public channels the user is not a part of.'})
    getPublicChannelsNotInUser(@Param('username') username: string) {
        return this.usersService.getPublicChannelsNotInUser(username);
    }

    @Patch(':username')
    @ApiResponse({ status: HttpStatus.OK, type: DisplayNameClass, description: 'Update users displayname.'})
    updateUser(
        @Param('username') username: string,
        @Body('displayName') displayName: string)
    {
        return this.usersService.updateUserDisplayName(username, displayName);
    }

    @Patch(':username/completeSetup')
    @ApiResponse({ status: HttpStatus.OK, description: 'Update users setup status.'})
    completeUserSetup(@Param('username') username: string){
        return this.usersService.completeSetup(username);
    }

    @Get(':username/users')
    @UseGuards(JwtAuthGuard)
    @ApiResponse({ status: HttpStatus.OK, type: [GetUsersInfoResponse], description: 'Get a list of users without {username} user.'})
    getOtherUsers(@Param('username') username: string) {
        return this.usersService.getOtherUsers(username);
    }
    
    @Post(':username/block-user')
    @ApiResponse({ status: HttpStatus.OK, type: GetUserDetailResponse, description: 'Block a user.'})
    blockUser(@Param('username') username: string, @Body('username') blocked_username: string) {
        return this.usersService.blockUser(username, blocked_username);
    }
}