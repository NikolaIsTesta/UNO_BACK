import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationError, UseGuards, Req } from '@nestjs/common';
import { LobbyService } from './lobby.service';
import { CreateLobbyDto } from './dto/create-lobby.dto';
import { UpdateLobbyDto } from './dto/update-lobby.dto';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiExtraModels, ApiOkResponse, ApiOperation, ApiParam, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { Lobby } from './entities/lobby.entity';
import JwtAuthenticationGuard from 'src/authentication/jwt-authentication.guard';
import RequestWithUser from 'src/authentication/requestWithUser.interface';



@ApiTags('lobby')
@Controller('lobby')
export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {}

  @Post()
  @ApiOperation({ summary: "Create a lobby" })
  @ApiCreatedResponse({ type: CreateLobbyDto })
  @ApiBadRequestResponse({ description: 'Lobby doesnt created' })
  @ApiBody({
    type: CreateLobbyDto,
    description: "It records the ID of the creator of the room and selects the game mode. A unique code is generated automatically, using this code, players can enter the lobby",
    examples: {
        b: {
            summary: "New lobby",
            description: "Example of creating a lobby",
            value: { hostId: 123, numPlayers: 4 } as CreateLobbyDto
        }
    }
})
  create(@Body() createLobbyDto: CreateLobbyDto) {
    return this.lobbyService.create(createLobbyDto);
  }
  

  @Post('join-lobby/:id')
  @ApiOperation({ summary: "Enter the lobby" })
  @ApiOkResponse({ description: 'Enter the lobby has been made successfully.'})
  @ApiBadRequestResponse({ description: 'Enter the lobby cannot be made' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'There must be a user with an ID who wants to enter the lobby',
    type: Number
  })
  @ApiBody({
    type: CreateLobbyDto,
    description: "The code of the lobby that the user wants to enter and the ID of the user who wants to connect are transmitted",
    examples: {
        a: {
            summary: "Join the lobby",
            description: "Example of join a lobby",
            value: { code: "123abc" } as CreateLobbyDto
        }
    }
})
  async joinLobby(@Param('id') id: string, @Body() createLobbyDto: CreateLobbyDto) {
    return this.lobbyService.joinLobby(+id, createLobbyDto);
  }


  @UseGuards(JwtAuthenticationGuard)
  @Post('exit:id')
  @ApiOperation({ summary: "Exit the lobby" })
  @ApiOkResponse({ description: 'Exit from the lobby was successfully completed.'})
  @ApiBadRequestResponse({ description: 'It is not possible to exit the lobby' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'There must be a ID user who wants to exit from lobby',
    type: Number
  })
  async exitLobby(@Param('id') id: string) {
    return this.lobbyService.exitLobby(+id);
  }

  @Get('kick/:id')
  @ApiOperation({ summary: "Kick player from lobby" })
  @ApiOkResponse({ description: 'player has been removed.'})
  @ApiBadRequestResponse({ description: 'It is not possible to kick a player' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'There must be user ID that they want to kick',
    type: Number
  })
  async kickPlayer(@Param('id') id: string) {
    //return this.lobbyService.exitLobby(+id);
  }

//сваггеры
  @UseGuards(JwtAuthenticationGuard)
  @Get("hostId")
  async getHostId(@Req() request: RequestWithUser){
    return this.lobbyService.getHostIdFromIdLobby(request.user.lobbyId);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get("getInfo/all-players")
  async getPlayers(@Req() request: RequestWithUser){
    return this.lobbyService.getAllPlayersInLobby(request.user.lobbyId);
  }
}
