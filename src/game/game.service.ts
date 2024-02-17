import { Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CardService } from 'src/card/card.service';
import RequestWithUser from 'src/authentication/requestWithUser.interface';
import { CreateCardDto } from 'src/card/dto/create-card.dto';
import { number } from 'joi';

@Injectable()
export class GameService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cardService: CardService) {}

  async findOne(lobbyId: number) {
    return await this.prismaService.game.findFirst({ where: { lobbyId } })
  }
  async startGame(lobbyId: number) {
    await this.generateUserTurn(lobbyId);
    let newGame = await this.generateDeck({ lobbyId, deck: [], currentCards: [] });
    newGame = await this.generateUsersDeck(newGame);
    newGame.currentPlayer = 0;
    const createdGame = await this.prismaService.game.create({ data: newGame });
    const currentPlayerId = await this.getCurrentPlayerId(lobbyId, createdGame.currentPlayer);
    return { id: createdGame.id, currentPlayerId: currentPlayerId }
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
    const colors = ['red', 'blue', 'green', 'yellow'];
    for (let i = 0; i < lobby.numPlayers; i++)
    {
      let userDeck: { color: string, value: string }[] = [];
      for (let j = 0; j < 7; j++)
      {
        let newCardIndex = Math.floor(Math.random() * (createGameDto.deck.length - 1));
        if (await this.isSpecialCard(createGameDto.deck[newCardIndex])) {
          createGameDto.deck[newCardIndex].color =  colors[Math.floor(Math.random() * (colors.length - 1))];
        }
        userDeck.push(createGameDto.deck[newCardIndex]);
        createGameDto.deck.splice(newCardIndex, 1);
        if (userFromLobby[i].numberInTurn == lobby.numPlayers - 1 && j == 0)
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
    const lobbyId = request.user.lobbyId
    const userCards: any[] = request.user.cards; 
    const numberCard = await this.getNumberCard(userCards, playerCard);
    if (numberCard === undefined) {
      return "The user does not have such a card"
    }
    let currentCards = await this.getCurrentCards(lobbyId);
    const currentCard = currentCards[currentCards.length - 1];
    const checkCard = await this.checkingCard(playerCard, currentCard);
    if (!checkCard){
      return "It is impossible to use this card"
    }
    currentCards = await this.processingMove(playerCard, currentCard, lobbyId);
    const nextPlayer = await this.chooseNextPlayer(lobbyId);
    const nextPlayerId = await this.getCurrentPlayerId(lobbyId, nextPlayer);
    await this.removeCardFromHand(userCards, numberCard, request.user.id);
    await this.updateGameData(lobbyId, currentCards, nextPlayer);
    return { nextPlayerId: nextPlayerId };
  }

  async getNumberCard(userCards: any[], playerCard: CreateCardDto) { 
    
    let numberCard: number | undefined; 
    for (let i = 0; i < userCards.length; i++) { 
      const card = userCards[i] as CreateCardDto;
      if (card.color === playerCard.color && card.value === playerCard.value) { 
        numberCard = i;
        return numberCard; 
      }
    }
    return numberCard
  }

  async removeCardFromHand(userCards: any[], numberCard: number, userId: number) {
    userCards.splice(numberCard, 1);
    await this.prismaService.user.update({
      where: { id: userId },
      data: { cards: userCards }
    })
  }

  async getCurrentCards(lobbyId: number) {
    const CurrentCardsField = await this.prismaService.game.findFirst({
      where: { lobbyId },
      select: { currentCards: true }
    })
    const currentCards = CurrentCardsField.currentCards as any[];
    return currentCards
  }

  async checkingCard(playerCard: CreateCardDto, currentCard: CreateCardDto) {
    const specialPlayerCard = await this.isSpecialCard(playerCard);
    const specialCurrentCard = await this.isSpecialCard(currentCard);
    if (specialPlayerCard) {
      if (!specialCurrentCard) {
        return true
      }
      if (playerCard.value === 'wild draw 4') {
        return true
      }
      if (playerCard.value === 'wild' && currentCard.value !== 'wild draw 4') {
        return true
      }
      return false
    }

    if (playerCard.color === currentCard.color && currentCard.value !== 'draw 2') {
      return true
    }
    else
      if (playerCard.value === currentCard.value || playerCard.value === 'draw 2 used' && currentCard.value === "draw 2 used") {
        return true
      }
    return false
  }

  async isSpecialCard(playerCard: CreateCardDto) {
    const specialCards = ['wild', 'wild draw 4'];
    if (specialCards.includes(playerCard.value)) {
      return true
    }
    return false
  }

  async processingMove(playerCard: CreateCardDto, currentCard: CreateCardDto, lobbyId: number) {
    const game = await this.prismaService.game.findFirst({ where: { lobbyId } });
    let currentCards = game.currentCards as any[];
    if (await this.isDrawCard(currentCard)) {
      currentCards.push(playerCard);
      return currentCards;
    }
    currentCards = [playerCard];
    switch (currentCards[0]) {
      case 'reverse':
          await this.playReverseCard(lobbyId);
          break;
      case 'skip':
          await this.playSkipCard(lobbyId);
          break;
      default:
          break;
    }
    return currentCards;
  }

  async isDrawCard(card: CreateCardDto) {
    const drawCards = ['draw 2', 'draw 4'];
    if (drawCards.includes(card.value)) {
      return true
    }
    return false
  }

  async playReverseCard(lobbyId: number) {
    const game = await this.prismaService.game.findFirst({ where: { lobbyId } });
    await this.prismaService.game.update({ 
      where: { lobbyId },
      data: { direction: !game.direction }
     })
  }

  async playSkipCard(lobbyId: number) {
    const newCurrentPlayer = await this.chooseNextPlayer(lobbyId);
    await this.prismaService.game.update({ 
      where: { lobbyId },
      data: { currentPlayer: newCurrentPlayer }
    })
  }

  async chooseNextPlayer(lobbyId: number) {
    const game = await this.prismaService.game.findFirst({ where: { lobbyId } });
    const lobby = await this.prismaService.lobby.findFirst({ where: { id: lobbyId } });
    const sizeLobby = lobby.numPlayers;
    let currentPlayer = game.currentPlayer
    if (game.direction == false) {
      currentPlayer = (currentPlayer + 1) % sizeLobby;
    }
    else {
      currentPlayer = (currentPlayer - 1) < 0 ? sizeLobby: currentPlayer - 1;
    }
    return currentPlayer;
  }

  async updateGameData(lobbyId: number, newCurrentCards: any[], newCurrentPlayer: number) {
    await this.prismaService.game.update({ 
      where: { lobbyId }, 
      data: {
         currentCards: newCurrentCards,
         currentPlayer: newCurrentPlayer
      }
    })
  }

  async getCurrentPlayerId(lobbyId: number, currentPlayer: number) {
    const user = await this.prismaService.user.findFirst({ where: {
      lobbyId,
      numberInTurn: currentPlayer 
      }
    });
    return user.id
  }


  async drawingCard( request: RequestWithUser) {
    const lobbyId = request.user.lobbyId
    let currentCards = await this.getCurrentCards(lobbyId);
    let countCards = 0;
    if (await this.isDrawCard(currentCards[0])) {
      countCards = await this.sumDrawingCards(currentCards);
      const newCurrentCards = currentCards[currentCards.length - 1] as CreateCardDto;
       newCurrentCards.value = "Draw 2 used";



    }
    else {
      countCards = 1;
    }
    const cardsTaken = await this.takeCardFromDeck(countCards, lobbyId);
    await this.updateUserCards(cardsTaken, request.user.id);
    const nextPlayer = await this.chooseNextPlayer(lobbyId);
    const nextPlayerId = await this.getCurrentPlayerId(request.user.lobbyId, nextPlayer);
    await this.updateGameData(lobbyId, currentCards, nextPlayer);
    return { nextPlayerId: nextPlayerId };
  }

  async takeCardFromDeck(count: number, lobbyId: number) {
    const game = await this.findOne(lobbyId);
    const deck = game.deck as any[];
    let cardsTaken = [] as CreateCardDto[];
    for (let i = 0; i < count; i++) {
      cardsTaken.push(deck[deck.length - 1]);
    }
    return cardsTaken;
  }

  async sumDrawingCards(currentCards: any[]) {
    let currentCard: CreateCardDto;
    let sumDrawingCards = 0;
    for (let i = 0; i < currentCards.length; i++) {
      currentCard = currentCards[i];
      sumDrawingCards += await this.DrawingCardToNumber(currentCard);
    }
    return sumDrawingCards;
  }

  async DrawingCardToNumber(currentCard: CreateCardDto) {
    switch (currentCard.value) {
      case 'draw 2': return 2;
      case 'wild draw 4': return 4;
      default: return 0;
    }
  }

  async updateUserCards(cardsTaken: any[], userId: number) {
    const user = await this.prismaService.user.findFirst({ where: { id:userId } });
    let userDeck = user.cards as any[];
    for (let i = 0; i < cardsTaken.length; i++) {
      userDeck.push(cardsTaken[i]);
    }
    await this.prismaService.user.update({
      where: { id: userId },
      data: { cards: userDeck }
    });
  }
}