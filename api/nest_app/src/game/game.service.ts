import { Injectable, NotFoundException} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Game } from '@prisma/client';
import { CreateGameDto, ScoreDto } from '../dto/game.dto';

@Injectable()
export class GameService {

	constructor(private prisma: PrismaService) {}

	async createGame(data: CreateGameDto): Promise<Game> {

		// ユーザーが存在しない場合、エラー
		const user = await this.prisma.user.findUnique({
			where: {
				username: data.username,
			}
		});
		if (!user) {
			throw new NotFoundException('User not found');
		}

		// ゲーム作成
		return this.prisma.game.create({
			data: {
				user1Name: data.username,
				status: 'matchmaking',
			},
		});
	}

	async getMatchmakingGames(): Promise<Game[]> {
		
		// マッチメイキング中のゲームを返却
		return this.prisma.game.findMany({ where: { status: 'matchmaking' } });
	}

	async joinGame(data: CreateGameDto, gameId: string): Promise<Game> {

		// ユーザーがいない場合、エラー
		const user = await this.prisma.user.findUnique({
			where: {
				username: data.username,
			}
		});
		if (!user) {
			throw new NotFoundException('User not found');
		}

		// ゲームがない場合、エラー
		const game = await this.prisma.game.findUnique({
			where: { id: gameId }
		});
		if (!game) {
			throw new NotFoundException('Game not found');
		}
	
		// ユーザー1とユーザー2が同一の場合、エラー
		if (game.user1Name == data.username) {
			throw new Error('Username1 and Username2 cannot be the same.');
		}

		// ユーザー情報とスコアを更新
		return this.prisma.game.update({
			where: { id: gameId },
			data: {
				user2Name: data.username,
				status: 'start',
				score1: 0,
				score2: 0,
			},
		});
	}

	async updateGameScore(gameId: string, data: ScoreDto): Promise<Game> {

		// 結果の更新
		if (data.score1 > data.score2) {
			
			// ゲーム更新
			const game = await this.prisma.game.update({
				where: { id: gameId },
				data: {
					score1: data.score1,
					result1: 'win',
					score2: data.score2,
					result2: 'lose',
					status: 'finish'
				},
			});
			// ユーザー更新
			const user1 = await this.prisma.user.update({
				where: { username: game.user1Name },
				data: {
					wins: {
						increment: 1,
					},
					ladderLevel : {
						increment: 10
					}
				},
			});
			const user2 = await this.prisma.user.update({
				where: { username: game.user2Name },
				data: {
					losses: {
						increment: 1,
					},
				},
			});

		} else if (data.score2 > data.score1) {
			
			// ゲーム更新
			const game = await this.prisma.game.update({
				where: { id: gameId },
				data: {
					score1: data.score1,
					result1: 'lose',
					score2: data.score2,
					result2: 'win',
					status: 'finish'
				},
			});

			// ユーザー更新
			const user1 = await this.prisma.user.update({
				where: { username: game.user1Name },
				data: {
					losses: {
						increment: 1,
					},
				},
			});
			const user2 = await this.prisma.user.update({
				where: { username: game.user2Name },
				data: {
					wins: {
						increment: 1,
					},
					ladderLevel : {
						increment: 10
					}
				},
			});
		} else {
			const game = await this.prisma.game.update({
				where: { id: gameId },
				data: {
					score1: data.score1,
					result1: 'draw',
					score2: data.score2,
					result2: 'draw',
					status: 'finish'
				},
			});
		}

		// ユーザー情報とスコアを更新
		return this.prisma.game.findUnique({
			where: { id: gameId }
		});

	}

	async getUserMatchHistory(username: string): Promise<Game[]> {
		return this.prisma.game.findMany({
			where: {
				OR: [{ user1Name: username }, { user2Name: username }],
				status: 'finish',
			},
		});
	}
}