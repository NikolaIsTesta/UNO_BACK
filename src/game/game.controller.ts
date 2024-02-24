import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/authentication/jwt-authentication.guard';
import HostGuard from 'src/guards/host.guard';
import RequestWithUser from 'src/authentication/requestWithUser.interface';
import { CreateCardDto } from 'src/card/dto/create-card.dto';
import PlayerTurnGuard from 'src/guards/player-turn.guard';
import NotUnoMove from 'src/guards/not-uno-move.guard';
import LobbyFilledGuard from 'src/guards/lobby-filled.guard';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class nexpPlayerDto {
  @ApiProperty({ example: 2 })
  nextPlayerId: number
}

export class userDataDto {
  @ApiProperty({ example: 3 })
  id: number;
  @ApiProperty({ example: 7 })
  countCards: number;
  @ApiProperty({ example: "Rei" })
  nickname: string;
}

export class gameDataDto {
  @ApiProperty()
  gameID: number;
  @ApiProperty( { example: [
    {
      "color": "blue",
      "value": "4"
    }
  ]})
  currentCards: CreateCardDto[];
  @ApiProperty({ example: [
    {
      "color": "yellow",
      "value": "draw 2"
    }
  ]})
  currentPlayerCards: CreateCardDto[];
  @ApiProperty({ example: [
    {
      "id": 1,
      "countCardsards": 3,
      "nickname": "Игрок1"
    },
    {
      "id": 2,
      "countCardsards": 6,
      "nickname": "Игрок2"
    }
  ]})
  userCardsField: userDataDto[];
  @ApiProperty({ example: 3 })
  currentPlayerId: number;
  @ApiProperty({ example: "Rei01" })
  currentNickname: string
}

@ApiTags('game')
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @UseGuards(JwtAuthenticationGuard, HostGuard, LobbyFilledGuard)
  @Get('start')
  @ApiOperation({ summary: "The game has started" })
  @ApiBadRequestResponse({ description: 'Game doesnt created' })
  async startGame(@Req() request: RequestWithUser) {
    return await this.gameService.startGame(request.user.lobbyId);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get('data')
  @ApiOperation({ summary: "Get game data" })
  @ApiOkResponse({ type: gameDataDto })
  @ApiBadRequestResponse({ description: 'There is no game session' })
  async getGameData(@Req() request: RequestWithUser) {
    const user = request.user as CreateUserDto;
    return await this.gameService.getGameDataFromId(user);
  }


  @UseGuards(JwtAuthenticationGuard, PlayerTurnGuard, NotUnoMove)
  @Post('motion/card')
  @ApiOkResponse({ type: nexpPlayerDto })
  @ApiBadRequestResponse({ description: 'The move cannot be made' })
  @ApiOperation({ summary: "Make a move" })
  @ApiBody({
    type: CreateGameDto,
    description: "The request contains card that the player used",
    examples: {
        a: {
            summary: "Make a move",
            description: "Example of a move",
            value: { color: "red",  value: "1",  } as unknown as CreateGameDto
        }
    }
})
  async makeMoveWithCard(@Req() request: RequestWithUser, @Body() playerCard: CreateCardDto) {
    return await this.gameService.putCardDown(request, playerCard);
  }

  @UseGuards(JwtAuthenticationGuard, PlayerTurnGuard, NotUnoMove)
  @Post('motion/take')
  @ApiOkResponse({ type: nexpPlayerDto })
  @ApiOperation({ summary: "Take the card" })
  async makeDrawingMove(@Req() request: RequestWithUser) {
    return await this.gameService.drawingCardMove(request);
  }
  
  @UseGuards(JwtAuthenticationGuard)
  @Post('uno-move')
  @ApiOperation({ summary: "Make a UNO-move" })
  @ApiCreatedResponse({ status: 201, description: 'Move has been made successfully.'})
  @ApiBadRequestResponse({ description: 'Game doesnt created' })
  async unoMove(@Req() request: RequestWithUser) {
    return await this.gameService.makeUnoMove(request.user.id);
  }

}
