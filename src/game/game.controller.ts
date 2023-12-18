import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateLobbyDto } from 'src/lobby/dto/create-lobby.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@ApiTags('game')
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('start')
  @ApiOperation({ summary: "Start the game" })
  @ApiCreatedResponse({ type: CreateGameDto })
  @ApiBadRequestResponse({ description: 'Game doesnt created' })
  @ApiBody({
    type: CreateGameDto,
    description: "To create a game, you need to enter the ID of the lobby, with the help of it, the lobby itself will already be found, in which the ids of the players and the game mode are indicated",
    examples: {
        a: {
            summary: "Start the game with parameters from lobby",
            description: "Example of start the game",
            value: { lobbyId: 123 } as CreateGameDto
        }
    }
})
  async startGame(@Body() createGameDto: CreateGameDto) {
    return this.gameService.startGame(createGameDto);
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
