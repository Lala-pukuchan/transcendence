import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { GameGateway } from 'src/game/game.gateway';

@Module({
  providers: [ChatGateway, GameGateway]
})
export class GateModule {}
