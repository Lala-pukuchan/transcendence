import { SubscribeMessage, WebSocketGateway, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway {

	@WebSocketServer()
	server: Server;

	//public gameSocketRoomMap: Map<string, string> = new Map();
	
	// ログ出力用
	private logger: Logger = new Logger('GameGateway');	
	// クライアントからメッセージ受信時の処理
	@SubscribeMessage('paddle')
	handlePaddle(@MessageBody() message: string, @ConnectedSocket() socket: Socket) {
		// ログ出力
		// this.logger.log("paddle received: " + JSON.stringify(message));	
		// クライアントにメッセージ送信
		const rooms = [...socket.rooms].slice(0);
		this.server.to(rooms[1]).emit('opponentPaddle', message);
		// this.server.emit('opponentPaddle', message);
	}

	@SubscribeMessage('joinGameRoom')
	joinOrUpdateRoom(@MessageBody() roomId: string, @ConnectedSocket() socket: Socket) {	
		// ログ出力
		this.logger.log("JOIN socket id: " + socket.id, "gameRoom id: " + roomId);
		
		//console.log("joinRoom socket id: " + socket.id, "room id: " + roomId);
		// ユーザーとルームのマッピングを追加
		//this.gameSocketRoomMap.set(socket.id, roomId);

		// ルームに参加（既に他ルームに参加している場合は退室）
		const rooms = [...socket.rooms].slice(0);
		if (rooms.length == 2) socket.leave(rooms[1]);
		socket.join(roomId);	
	}

	@SubscribeMessage('changeGameStatus')
	handleGameOn(@MessageBody() message: string, @ConnectedSocket() socket: Socket) {
		// ログ出力
		// this.logger.log("paddle received: " + JSON.stringify(message));	
		// クライアントにメッセージ送信
		const rooms = [...socket.rooms].slice(0);
		this.server.to(rooms[1]).emit('GameStatus', message);
		// this.server.emit('GameStatus', message);
	}

	@SubscribeMessage('ball')
	handleBall(@MessageBody() message: string, @ConnectedSocket() socket: Socket) {
		const rooms = [...socket.rooms].slice(0);
		this.server.to(rooms[1]).emit('centerball', message);
		// this.server.emit('centerball', message);
	}

	@SubscribeMessage('matched')
	handleMatch(@MessageBody() message: string, @ConnectedSocket() socket: Socket) {
		const rooms = [...socket.rooms].slice(0);
		this.server.to(rooms[1]).emit('matchedGame', message);
		this.logger.log("MATCHED socket id: " + socket.id, "gameRoom id: " + rooms[1]);
		// this.server.emit('centerball', message);
	}

	@SubscribeMessage('ballSize') // Match with the emitted event name from the client
	handleBallSizeUpdate(
	  @MessageBody() newValue: number,
	  @ConnectedSocket() socket: Socket,
	) {
	  // Process the received ball size update (newValue) here
	  
	  // Broadcast the updated ball size to all connected clients (except the sender)
	  socket.broadcast.emit('ballSizeUpdate', newValue);
	}

	@SubscribeMessage('exitRoom') // Match with the emitted event name from the client
  	handleExitRoom(
    @MessageBody() socketId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    // Process the exitRoom event here
    // For example, you might want to remove the socket from the current room
    
    // Broadcast the exit information to the remaining clients in the room
	const rooms = [...socket.rooms].slice(0);
    this.server.to(rooms[1]).emit('userLeft', "bye");
  }
}
