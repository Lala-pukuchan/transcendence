import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StatusService {

	constructor(private prisma: PrismaService) {}

	async getUsersGameRoom(username: string) {

		try {

			// ユーザーの所属するゲームルームIDの取得
			const game = await this.prisma.game.findFirst({
				where: {
					OR: [
						{ user1Name: username },
						{ user2Name: username },
					],
					status: {
						in: ['start', 'matchmaking'],
					},
				},
				select: { roomId: true },
			});

			// ユーザーの所属するゲームルームを終了
			if (game?.roomId) {
				const updatedGame = await this.prisma.game.updateMany({
					where: {
						roomId: game.roomId,
					},
					data: {
						status: 'finish',
					},
				});
				const roomIdString = game.roomId.toString();
				console.log(`The disconnected user: ${username} was in room: ${roomIdString}`);
				return (roomIdString);
			} else {
				console.log('The disconnected user was not in any game room with status "start, matchmaking".');
				return (null);
			}

		} catch (error) {
			console.log('Error while querying the database:', error);
			return (null);
		} 
	}
}
