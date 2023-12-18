import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CardModule } from 'src/card/card.module';

@Module({
  imports: [PrismaModule, CardModule],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
