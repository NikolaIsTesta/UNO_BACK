import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { LobbyModule } from './lobby/lobby.module';
import { GameModule } from './game/game.module';
import { PrismaModule } from './prisma/prisma.module';
import { CardModule } from './card/card.module';

@Module({
  imports: [UsersModule, LobbyModule, GameModule, PrismaModule, CardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
