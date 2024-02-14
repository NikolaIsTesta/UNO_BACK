import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from 'src/guards/local.auth.guard';
import JwtAuthenticationGuard from 'src/authentication/jwt-authentication.guard';
import HostGuard from 'src/guards/host.guard';
import RequestWithUser from 'src/authentication/requestWithUser.interface';
export class gameIdDto {
  @ApiProperty({ example: 1 })
  id: number;
}

@ApiTags('game')
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @UseGuards(JwtAuthenticationGuard, HostGuard)
  @Get('start')
  @ApiOperation({ summary: "The host starts the game" })
  @ApiCreatedResponse({ type: gameIdDto })
  @ApiBadRequestResponse({ description: 'Game doesnt created' })
  async startGame(@Req() request: RequestWithUser) {
    return this.gameService.startGame(request.user.lobbyId);
  }


  @Get(':id')
  @ApiOperation({ summary: "Get game data" })
  @ApiOkResponse({ type: CreateGameDto })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Get all the data about the current game by ID',
    type: Number
  })
  async nothink_3() {
    return true;
  }


  @Post('motion')
  @ApiResponse({ status: 201, description: 'Move has been made successfully.'})
  @ApiBadRequestResponse({ description: 'The move cannot be made' })
  @ApiOperation({ summary: "Make a move" })
  @ApiBody({
    type: CreateGameDto,
    description: "The request contains the game ID, the ID of the player who made the move and the card that the player used",
    examples: {
        a: {
            summary: "Make a move",
            description: "Example of a move",
            value: { id: 321,  lobbyId: 123, currentCards: [{ value: "1", color: "red" }]} as CreateGameDto
        }
    }
})
  async nothink_7() {
    return true;
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
