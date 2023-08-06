import { Module } from '@nestjs/common';
import { StatusGateway } from './status.gateway';
import { StatusService } from './status.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [PrismaService, StatusGateway, StatusService]
})
export class StatusModule {}
