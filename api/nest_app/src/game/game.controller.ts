// game.controller.ts
import { Controller, Get, Param, Post, HttpStatus, Put, Body } from '@nestjs/common';
import { GameService } from './game.service';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { CreateGameDto, ScoreDto } from 'src/dto/game.dto';

@ApiTags('games')
@Controller('games')
export class GameController {
  constructor(private gameService: GameService) {}

  @Post()
  @ApiResponse({ status: HttpStatus.OK, type: CreateGameDto })
  async createGame(@Body() createGameDto: CreateGameDto) {
    return this.gameService.createGame(createGameDto);
  }

  @Get('matchmaking')
  @ApiResponse({ status: HttpStatus.OK })
  async getMatchmakingGames() {
    return this.gameService.getMatchmakingGames();
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
