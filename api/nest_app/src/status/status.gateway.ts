import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class StatusGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  // オンラインユーザー
  private onlineUsers: Map<string, string> = new Map();

  // オンラインゲームユーザー
  private onlineGameUsers: Map<string, string> = new Map();
  
  // ログ出力用
  private logger: Logger = new Logger('StatusGateway');

  // 接続
  handleConnection(client: Socket) {

    client.on('online', (username: string) => {
  
      this.onlineUsers.set(client.id, username);

      console.log("[ online socket count: ", this.onlineUsers.size, "]"); 
      const onlineUsernames = new Set();
      this.onlineUsers.forEach((username, clientId) => {
        console.log(`|-- Username: ${username}, Client ID: ${clientId}`);
        onlineUsernames.add(username);
      });

      const onlineUsersArray = Array.from(onlineUsernames);
      this.server.emit('onlineUsers', onlineUsersArray);

      console.log("< game online socket count: ", this.onlineGameUsers.size, ">"); 
      const onlineGameUsernames = new Set();
      this.onlineGameUsers.forEach((username, clientId) => {
        console.log(`|--- Username: ${username}, Client ID: ${clientId}`);
        onlineGameUsernames.add(username);
      });

      const onlineGameUsersArray = Array.from(onlineGameUsernames);
      console.log('onlineGameUsersArray: ', onlineGameUsersArray);
      this.server.emit('onlineGameUsers', onlineGameUsersArray);

    });

    client.on('gaming', (username: string) => {
      console.log(`username: ${username}, socketId: ${client.id} starts gaming.`);
      this.onlineGameUsers.set(client.id, username);
    });

    client.on('returnBack', (username: string) => {
      console.log(`username: ${username}, socketId: ${client.id} is disconnected.`);
      this.onlineGameUsers.delete(client.id);
    });

  }

  // 切断
  handleDisconnect(client: Socket) {
    
    console.log(`Client disconnected: ${client.id}`);    
    this.onlineUsers.delete(client.id);

    console.log("[ online socket count: ", this.onlineUsers.size, "]");
    this.onlineUsers.forEach((username, clientId) => {
      console.log(`|-- Username: ${username}, Client ID: ${clientId}`);
    });

    this.onlineGameUsers.delete(client.id);

    console.log("< game online socket count: ", this.onlineGameUsers.size, ">");
    this.onlineGameUsers.forEach((username, clientId) => {
      console.log(`|--- Username: ${username}, Client ID: ${clientId}`);
    });

  }

}
