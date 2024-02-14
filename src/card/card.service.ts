import { Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CardService {
  constructor(
    private readonly prismaService: PrismaService,
  ) {}

  async createDeck() {
    const colors = ['red', 'blue', 'green', 'yellow'];
    const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw 2'];

    const deck: CreateCardDto[] = [];

    for (const color of colors) {
      for (const value of values) {
        if (value != '0') {
          deck.push({
            color, value
          });
        }
        deck.push({
          color, value
        });
      }
    }

    for (let i = 0; i < 4; i++){
      deck.push({
        color: 'special', value: 'wild'
      });
      deck.push({
        color: 'special', value: 'wild draw 4'
      });
    }

    const shuffledDeck = this.shuffleDeck(deck);
    return shuffledDeck;
  }
    private shuffleDeck(deck: CreateCardDto[]): CreateCardDto[] {
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      return deck;
    }
}
