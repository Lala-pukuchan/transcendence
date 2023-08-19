// game.controller.ts
import { Controller, Get, Param, Post, HttpStatus, Put, Body, UseGuards } from '@nestjs/common';
import { GameService } from './game.service';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { CreateGameDto, ScoreDto } from 'src/dto/game.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guards';

@ApiTags('games')
@UseGuards(JwtAuthGuard)
@Controller('games')
export class GameController {
  constructor(private gameService: GameService) {}

  @Post()
  @ApiResponse({ status: HttpStatus.OK, type: CreateGameDto })
  async createGame(@Body() createGameDto: CreateGameDto) {
    return this.gameService.createGame(createGameDto);
  }

  @Post('/invite/:username')
  @ApiResponse({ status: HttpStatus.OK, type: CreateGameDto })
  async createInvitation(@Param('username') username: string, @Body('opponent') opponent: string) {
    return this.gameService.createInvitation(username, opponent);
  }

  @Get('matchmaking/:username')
  @ApiResponse({ status: HttpStatus.OK })
  async getMatchmakingGames(@Param('username') username: string) {
    return this.gameService.getMatchmakingGames(username);
  }

  @Put(':gameId/join')
  @ApiResponse({ status: HttpStatus.OK, type: CreateGameDto })
  async joinGame(@Param('gameId') gameId: string, @Body() createGameDto: CreateGameDto) {
    return this.gameService.joinGame(createGameDto, gameId);
  }

  @Put(':gameId/score')
  @ApiResponse({ status: HttpStatus.OK, type: ScoreDto })
  async updateGameScore(
    @Param('gameId') gameId: string,
    @Body() scoreDto: ScoreDto
  ) {
    return this.gameService.updateGameScore(gameId, scoreDto);
  }

  @Get('user/:username/match-history')
  @ApiResponse({ status: HttpStatus.OK })
  async getUserMatchHistory(@Param('username') username: string) {
    return this.gameService.getUserMatchHistory(username);
  }

}
