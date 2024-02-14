import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CardModule } from 'src/card/card.module';
import { UsersModule } from 'src/users/users.module';
import { LobbyService } from 'src/lobby/lobby.service';

@Module({
  imports: [PrismaModule, CardModule, UsersModule],
  controllers: [GameController],
  providers: [GameService, LobbyService],
})
export class GameModule {}
