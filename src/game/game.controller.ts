import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/authentication/jwt-authentication.guard';
import HostGuard from 'src/guards/host.guard';
import RequestWithUser from 'src/authentication/requestWithUser.interface';
import { CreateCardDto } from 'src/card/dto/create-card.dto';
import PlayerTurnGuard from 'src/guards/player.turn.guard';
export class gameSartDto {
  @ApiProperty({ example: 1 })
  id: number;
  @ApiProperty({ example: 1 })
  currentPlayerId: number
}

@ApiTags('game')
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @UseGuards(JwtAuthenticationGuard, HostGuard)
  @Get('start')
  @ApiOperation({ summary: "The host starts the game" })
  @ApiCreatedResponse({ type: gameSartDto })
  @ApiBadRequestResponse({ description: 'Game doesnt created' })
  async startGame(@Req() request: RequestWithUser) {
    return this.gameService.startGame(request.user.lobbyId);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get('data')
  @ApiOperation({ summary: "Get game data" })
  @ApiOkResponse({ type: CreateGameDto })
  @ApiBadRequestResponse({ description: 'There is no game session' })
  async getGameData(@Req() request: RequestWithUser) {
    return this.gameService.getGameDataFromId(request.user.lobbyId);
  }


  @UseGuards(JwtAuthenticationGuard, PlayerTurnGuard)
  @Post('motion/card')
  @ApiResponse({ status: 201, description: 'Move has been made successfully.'})
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
    return this.gameService.putCardDown(request, playerCard);
  }


  @Post('uno-move')
  @ApiOperation({ summary: "Make a UNO-move" })
  @ApiBody({
    type: CreateGameDto,
    description: "The processing of the game situation is 'UNO', the request indicates the ID of the game and the player who first pressed the button",
    examples: {
        a: {
            summary: "Make a UNO-move",
            description: "Example of a move",
            value: { id: 321,  lobbyId: 123 } as CreateGameDto
        }
    }
})
  async nothink_5() {
    return true;
  }
  
}
