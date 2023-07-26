import { SubscribeMessage, WebSocketGateway, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway {

	@WebSocketServer()
	server: Server;
	
	// ログ出力用
	private logger: Logger = new Logger('GameGateway');	
	// クライアントからメッセージ受信時の処理
	@SubscribeMessage('paddle')
	handleMessage(@MessageBody() message: string, @ConnectedSocket() socket: Socket): string {
		// ログ出力
		// this.logger.log("paddle received: " + JSON.stringify(message));	
		// クライアントにメッセージ送信
		// const rooms = [...socket.rooms].slice(0);
		// this.server.to(rooms[1]).emit('update', message);
		this.server.emit('update', message);
		return 'Hello world!';
	
	}	
	@SubscribeMessage('joinRoom')
	joinOrUpdateRoom(@MessageBody() roomId: string, @ConnectedSocket() socket: Socket) {	
		// ログ出力
		this.logger.log("socket id: " + socket.id, "room id: " + roomId);	
		// ルームに参加（既に他ルームに参加している場合は退室）
		const rooms = [...socket.rooms].slice(0);
		if (rooms.length == 2) socket.leave(rooms[1]);
		socket.join(roomId);	
	}

}
