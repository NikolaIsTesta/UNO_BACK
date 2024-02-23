import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CardService } from 'src/card/card.service';
import RequestWithUser from 'src/authentication/requestWithUser.interface';
import { CreateCardDto } from 'src/card/dto/create-card.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LobbyService } from 'src/lobby/lobby.service';

async function throwBadRequestException(message: string) {
  throw new BadRequestException(message);
}

@Injectable()
export class GameService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cardService: CardService,
    private readonly lobbyService: LobbyService) {}

  async findOne(lobbyId: number) {
    return await this.prismaService.game.findFirst({ where: { lobbyId } }) as CreateGameDto;
  }
  async startGame(lobbyId: number) {
    await this.generateUserTurn(lobbyId);
    let newGame = await this.generateDeck({ lobbyId });
    newGame = await this.generateUsersDeck(newGame);
    newGame.currentPlayer = 0;
    const createdGame = await this.prismaService.game.create({ data: newGame });
    const currentPlayerId = await this.getCurrentPlayerId(lobbyId, createdGame.currentPlayer);
    return { id: createdGame.id, currentPlayerId: currentPlayerId }
  }

  async generateUserTurn(lobbyId: number) {
    const userTurn = [];
    const lobby = await this.lobbyService.findOne(lobbyId);
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
    const colors = ['red', 'blue', 'green', 'yellow'];
    let deck = await this.cardService.createDeck();
    let currentCard = Math.floor(Math.random() * (deck.length - 1));
    createGameDto.currentCards = [deck[currentCard]] as CreateCardDto[];
    if (await this.isSpecialCard(createGameDto.currentCards[0])) {
      createGameDto.currentCards[0].color =  colors[Math.floor(Math.random() * (colors.length - 1))];
    }
    deck.splice(currentCard, 1);
    createGameDto.deck = deck;
    return createGameDto;
  }

  async generateUsersDeck(createGameDto: CreateGameDto) {
    const lobby = await this.lobbyService.findOne(createGameDto.lobbyId);
    const userFromLobby = await this.prismaService.user.findMany({ where: { lobbyId: createGameDto.lobbyId } })
    for (let i = 0; i < lobby.numPlayers; i++)
    {
      let userDeck: CreateCardDto[] = [];
      let userId = userFromLobby[i].id;
      for (let j = 0; j < 7; j++)
      {
        let newCardIndex = Math.floor(Math.random() * (createGameDto.deck.length - 1));
        
        userDeck.push(createGameDto.deck[newCardIndex]);
        createGameDto.deck.splice(newCardIndex, 1);
        if (userFromLobby[i].numberInTurn == lobby.numPlayers - 1 && j == 0)
          j++;
      }
      await this.clearPlayersCards(userId);
      await this.updateUserCards (userDeck, userId);
    }
    return createGameDto;
  }

  async getGameDataFromId(user: CreateUserDto) {
    const lobbyId = user.lobbyId;
    const game = await this.prismaService.game.findFirst({
       where: { lobbyId },
       select: {
        id: true,
        lobbyId: true,
        currentCards: true,
        currentPlayer: true
       }
      })
    if (!game) {
      return "There is no game session";
    }
    const usersFromLobby = await this.prismaService.user.findMany({ where: { lobbyId } })
    const userCardsField = usersFromLobby.map(user => ({ id: user.id, countCardsards: user.cards.length }));
    const currentPlayerId = await this.getCurrentPlayerId(lobbyId, game.currentPlayer);
    const gameData = {
      gameID: game.id,
      lobbyID: game.lobbyId,
      currentCards: game.currentCards,
      currentPlayerCards: user.cards,
      userCardsField,
      currentPlayerId
    };
    return gameData;
  }

  async putCardDown( request: RequestWithUser, playerCard: CreateCardDto ) {
    const user = request.user as CreateUserDto;
    const lobbyId = user.lobbyId
    const userCards = user.cards; 
    const numberCard = await this.getNumberCard(userCards, playerCard);
    if (numberCard === -1) {
      return "The user does not have such a card"
    }
    let currentCards = await this.getCurrentCards(lobbyId);
    const currentCard = currentCards[currentCards.length - 1];
    const checkCard = await this.checkingUserCard(playerCard, currentCard);
    if (!checkCard){
      return "It is impossible to use this card"
    }
    currentCards = await this.processingMove(playerCard, currentCard, lobbyId);
    const nextPlayer = await this.chooseNextPlayer(lobbyId);
    const nextPlayerId = await this.getCurrentPlayerId(lobbyId, nextPlayer);
    const userId = request.user.id;
    await this.removeCardFromHand(numberCard, userId);
    const countUserCards = await this.getCountUserCards(userId);
    switch (countUserCards) {
      case 0: 
        return await this.endGame(lobbyId, userId);
      case 1: 
        await this.prismaService.game.update({ 
          where: { lobbyId },
          data: { UNO: true }
        });
       break;
      default: break;
    }
    await this.updateGameData(lobbyId, currentCards, nextPlayer);
    return { nextPlayerId: nextPlayerId };
  }

  async getNumberCard(userCards: CreateCardDto[], playerCard: CreateCardDto) {
    await Promise.all(userCards.map(async (card) => {
      if (await this.isSpecialCard(card)) {
        card.color = playerCard.color;
      }
    }))
    const index = userCards.findIndex(card => card.color === playerCard.color && card.value === playerCard.value);
    return index;
  }

  async removeCardFromHand(numberCard: number, userId: number) {
    const user = await this.prismaService.user.findUnique({ where: { id: userId } }) as CreateUserDto;
    const userCards = user.cards;
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
    }) as CreateGameDto;
    const currentCards = CurrentCardsField.currentCards;
    return currentCards
  }

  async checkingUserCard(playerCard: CreateCardDto, currentCard: CreateCardDto) {
    const specialPlayerCard = await this.isSpecialCard(playerCard);
    const specialCurrentCard = await this.isSpecialCard(currentCard);
    const drawCurrenCard = await this.isDrawCard(currentCard);
    if (specialPlayerCard) {
      if (!specialCurrentCard || playerCard.value === 'wild draw 4' || (playerCard.value === 'wild' && !drawCurrenCard)) {
        return true;
      }
      return false;
    }
    if (playerCard.color === currentCard.color && currentCard.value !== 'draw 2') {
      return true;
    }
  
    if (playerCard.value === currentCard.value || (playerCard.value === 'draw 2' && currentCard.value === 'draw 2 used')) {
      return true;
    }
  
    return false;
  }

  async isSpecialCard(playerCard: CreateCardDto) {
    const specialCards = ['wild', 'wild draw 4'];
    if (specialCards.includes(playerCard.value)) {
      return true
    }
    return false
  }

  async processingMove(playerCard: CreateCardDto, currentCard: CreateCardDto, lobbyId: number) {
    const game = await this.findOne(lobbyId);
    let currentCards = game.currentCards as CreateCardDto[];
    if (await this.isDrawCard(currentCard)) {
      currentCards.push(playerCard);
      return currentCards;
    }
    if (await this.isDrawUsedCard(currentCard)) {
      currentCard.value = currentCard.value.replace(' used', '');
      currentCards = [currentCard];
    }
    await this.spendCards(currentCards, lobbyId);
    currentCards = [playerCard];
    switch (currentCards[0].value) {
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
    const drawCards = ['draw 2', 'wild draw 4'];
    if (drawCards.includes(card.value)) {
      return true
    }
    return false
  }

  async playReverseCard(lobbyId: number) {
    const game = await this.findOne(lobbyId);
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
    const game = await this.findOne(lobbyId);
    const lobby = await this.prismaService.lobby.findFirst({ where: { id: lobbyId } });
    const sizeLobby = lobby.numPlayers;
    let currentPlayer = game.currentPlayer
    if (game.direction == false) {
      currentPlayer = (currentPlayer + 1) % sizeLobby;
    }
    else {
      currentPlayer = (currentPlayer - 1) < 0 ? sizeLobby - 1: currentPlayer - 1;
    }
    return currentPlayer;
  }

  async updateGameData(lobbyId: number, newCurrentCards: CreateCardDto[], newCurrentPlayer: number) {
    const formattedCurrentCards = newCurrentCards.map(card => ({...card}));
    await this.prismaService.game.update({ 
      where: { lobbyId }, 
      data: {
          currentCards: {
          set: formattedCurrentCards
        },
         currentPlayer: newCurrentPlayer
      }
    })
  }

  async getCurrentPlayerId(lobbyId: number, numberCurrentPlayer: number) {
    const user = await this.prismaService.user.findFirst({ where: {
      lobbyId,
      numberInTurn: numberCurrentPlayer 
      }
    });
    return user.id
  }

  async drawingCardMove( request: RequestWithUser) {
    const lobbyId = request.user.lobbyId
    let currentCards = await this.getCurrentCards(lobbyId);
    let countCards = 0;
    if (await this.isDrawCard(currentCards[0])) {
      countCards = await this.sumDrawingCards(currentCards);
      const newCurrentCards = currentCards[currentCards.length - 1] as CreateCardDto;
      if (newCurrentCards.value === "draw 2")
        newCurrentCards.value = "draw 2 used";
      else
        if (newCurrentCards.value === "wild draw 4")
          newCurrentCards.value = "wild draw 4 used";
    }
    else {
      countCards = 1;
    }
    let spentCards = currentCards.slice(0, currentCards.length - 1);
    await this.spendCards(spentCards, lobbyId);
    currentCards = [currentCards[currentCards.length - 1]];
    const cardsTaken = await this.takeCardFromDeck(countCards, lobbyId);
    await this.updateUserCards(cardsTaken, request.user.id);
    const nextPlayer = await this.chooseNextPlayer(lobbyId);
    const nextPlayerId = await this.getCurrentPlayerId(request.user.lobbyId, nextPlayer);
    await this.updateGameData(lobbyId, currentCards, nextPlayer);
    return { nextPlayerId: nextPlayerId };
  }

  async takeCardFromDeck(count: number, lobbyId: number) {
    const game = await this.findOne(lobbyId);
    let deck = game.deck;
    let spentCards = game.spentCards;
    let cardsTaken = [] as CreateCardDto[];
    let countDeckCards = await this.getCountGameDeckCards(lobbyId);
    for (let i = 0; i < count; i++) {
      if (countDeckCards === 0) {
        deck = await this.cardService.shuffleDeck(spentCards);
        spentCards = null;
      }
      cardsTaken.push(deck[deck.length - 1]);
      deck.pop();
      countDeckCards--;
    }
    await this.prismaService.game.update({
      where: { lobbyId }, 
      data: { 
        deck,
        spentCards
      }, 
    })
    return cardsTaken;
  }

  async sumDrawingCards(currentCards: CreateCardDto[]) {
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

  async updateUserCards(cardsTaken: CreateCardDto[], userId: number) {
    const user = await this.prismaService.user.findFirst({ where: { id:userId } }) as CreateUserDto;
    let userDeck = user.cards;
    if (!userDeck) {
      userDeck = [];
    }
    userDeck.push(...cardsTaken);
    await this.prismaService.user.update({
      where: { id: userId },
      data: { cards: userDeck }
    });
  }

  async switchUno(lobbyId: number) {
    const game = await this.findOne(lobbyId);
    const UNO = game.UNO;
    await this.prismaService.game.update({
       where: { lobbyId },
       data: { UNO: !UNO }
       })
  }

  async getCountUserCards(userId: number) {
    const user = await this.prismaService.user.findFirst({ where: { id: userId } }) as CreateUserDto;
    const userDeck = user.cards;
    const countUserCards = userDeck.length;
    return countUserCards;
  }

  async getCountGameDeckCards(lobbyId: number) {
    const game = await this.findOne(lobbyId);
    const gameDeck = game.deck;
    const countGameDeck = gameDeck.length;
    return countGameDeck;
  }

  async spendCards(cards: CreateCardDto[], lobbyId: number) {
    const game = await this.findOne(lobbyId);
    const spentCards = game.spentCards;
    for (let i = 0; i < cards.length; i++) {
      spentCards.push(cards[i]);
    }
    await this.prismaService.game.update({
      where: { lobbyId },
      data: { spentCards }
    })
  }

  async isDrawUsedCard(card: CreateCardDto) {
    if (card.value === "draw 2 used" || card.value === "wild draw 4 used") {
      return true;
    }
    return false;
  }

  async makeUnoMove(userId: number) {
   const user = await this.prismaService.user.findFirst({ where: { id: userId } });
    const lobbyId = user.lobbyId;
    const game = await this.findOne(lobbyId);
    if (!game.UNO) {
      return throwBadRequestException("You can't use UNO MOVE right now");
    }
    const unoPlayerId = await this.getPreviousPlayerId(game, user.numberInTurn);
    await this.prismaService.game.update({
      where: { lobbyId },
      data: { UNO: false }
    })
    if (unoPlayerId === user.id) {
      return { "UNO MOVE was successfully completed by the player: ": user.nickname }
    }
      const unoPlayer = await this.punishPlayer(unoPlayerId);
      return { "UNO MOVE was successfully completed by the player: ": user.nickname }
  }

  async getPreviousPlayerId (game: CreateGameDto, currentPlayerTurn: number) {
    const lobbyId = game.lobbyId;
    const lobby = await this.prismaService.lobby.findFirst({ where: { id: lobbyId } })
    const sizeLobby = lobby.numPlayers;
    let unoPlayerTurn: number;
    if (game.direction === false) {
      unoPlayerTurn = (currentPlayerTurn - 1) < 0 ? sizeLobby - 1: currentPlayerTurn - 1;
    }
    else {
      unoPlayerTurn = (currentPlayerTurn + 1) % sizeLobby;
    }
    const unoPlayer = await this.prismaService.user.findFirst({
      where: {  
        lobbyId: lobbyId,
        numberInTurn: unoPlayerTurn
      }
    })
    return unoPlayer.id;
  }

  async punishPlayer (playerId: number) {
    const player = await this.prismaService.user.findFirst({ where: { id: playerId } }) as CreateUserDto;
    const punishingPlayer = await this.takeCardFromDeck(2, player.lobbyId);
    const unoPlayer: CreateUserDto = { id: player.id, cards:  player.cards}
    const unoPlayerDeck = unoPlayer.cards;
    unoPlayerDeck.push(...punishingPlayer);
    await this.prismaService.user.update({ 
      where: { id: player.id },
      data: { cards: unoPlayerDeck }
     })
     return player;
  }

  async clearPlayersCards (userId: number) {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { cards: [] }
    })
  }

  async endGame (lobbyId: number, userId: number) {
    await this.prismaService.game.delete({ where: { lobbyId } });
    const user = await this.prismaService.user.findFirst({ 
      where: { id: userId }, 
      select: { 
        id: true, 
        nickname: true 
      } 
    })
    return user;
  }
}