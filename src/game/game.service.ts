import { Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CardService } from 'src/card/card.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import RequestWithUser from 'src/authentication/requestWithUser.interface';
import { CreateCardDto } from 'src/card/dto/create-card.dto';

@Injectable()
export class GameService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cardService: CardService) {}

  async startGame(lobbyId: number) {
    let createGameDto: CreateGameDto = {
      lobbyId,
      id: 0,
      deck: [],
      currentCards: []
    };
    await this.generateUserTurn(lobbyId);
    createGameDto = await this.generateDeck(createGameDto);
    createGameDto = await this.generateUsersDeck(createGameDto);
    const newGame = await this.prismaService.game.create({ data: createGameDto });
    return { id: newGame.id }
  }

  async generateUserTurn(lobbyId: number) {
    const userTurn = [];
    const lobby = await this.prismaService.lobby.findFirst({ where: { id: lobbyId } });
    for (let i = 0; i < lobby.numPlayers; i++)
      userTurn.push(i);
    userTurn.sort(() => Math.random() - 0.5);
    const userFromLobby = await this.prismaService.user.findMany({ where: { lobbyId: lobbyId } })
    for (let i = 0; i < lobby.numPlayers; i++){
      await this.prismaService.user.update({
        where: { id: userFromLobby[i].id },
        data:  { numberInTurn: userTurn[i] },
      });
    }
  }
  
  async generateDeck(createGameDto: CreateGameDto) {
    let deck = await this.cardService.createDeck();
    let currentCard = Math.floor(Math.random() * (deck.length - 1));
    createGameDto.currentCards = [deck[currentCard]];
    deck.splice(currentCard, 1);
    createGameDto.deck = deck;
    return createGameDto;
  }

  async generateUsersDeck(createGameDto: CreateGameDto) {
    const lobby = await this.prismaService.lobby.findFirst({ where: { id: createGameDto.lobbyId } });
    const userFromLobby = await this.prismaService.user.findMany({ where: { lobbyId: createGameDto.lobbyId } })
    for (let i = 0; i < lobby.numPlayers; i++)
    {
      let userDeck: { color: string, value: string }[] = [];
      for (let j = 0; j < 7; j++)
      {
        let newCardIndex = Math.floor(Math.random() * (createGameDto.deck.length - 1));
        userDeck.push(createGameDto.deck[newCardIndex]);
        createGameDto.deck.splice(newCardIndex, 1);
        if (userFromLobby[i].numberInTurn == 0 && j == 0)
          j++;
      }
      await this.prismaService.user.update({
        where: { id: userFromLobby[i].id },
        data:  { cards: userDeck },
      });
    }
    return createGameDto;
  }

  async getGameDataFromId(lobbyId: number) {
    const game = await this.prismaService.game.findFirst({
       where: { lobbyId },
       select: {
        id: true,
        lobbyId: true,
        currentCards: true
       }
      })
    if (!game) {
      return "There is no game session";
    }
    else
      return game;
  }

  async putCardDown( request: RequestWithUser, playerCard: CreateCardDto ) {
    const userCards = request.user.cards;
   // await this.getNumberCard(request);
    // if (userCards && userCards.length > 0) {
    //   const matchingCards = userCards.filter(card => (card as unknown as CreateCardDto).color  === playerCard.color && (card as unknown as CreateCardDto).value === playerCard.value);
    //   if (matchingCards.length > 0) {
    //     console.log("Найдены карты");
        
    //   } else {
    //     console.log('Карты не найдены');
    //   }
    // } else {
    //   console.log('Пользователь не имеет карт');
    // }
  }

  async getNumberCard(request: RequestWithUser, playerCard: CreateCardDto) {
    const userCards = request.user.cards;
    let numberCard;
    for (let i = 0; i < userCards.length; i++) {
      if ((userCards[i] as unknown as CreateCardDto).color === playerCard.color && (userCards[i] as unknown as CreateCardDto).value === playerCard.value)
      {
        numberCard = i;
      }
    }
  }
}
