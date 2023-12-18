import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CardService],
  exports: [CardService]
})
export class CardModule {}
