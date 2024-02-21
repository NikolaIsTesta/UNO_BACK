import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationError, UseGuards, Req } from '@nestjs/common';
import { LobbyService } from './lobby.service';
import { CreateLobbyDto } from './dto/create-lobby.dto';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiExtraModels, ApiOkResponse, ApiOperation, ApiParam, ApiProperty, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/authentication/jwt-authentication.guard';
import RequestWithUser from 'src/authentication/requestWithUser.interface';
import HostGuard from 'src/guards/host.guard';
import IsUserInLobbyGuard from 'src/guards/user-in-lobby.guard';
export class hostIdLobbyDto {
  @ApiProperty({ example: 1 })
  hostId: number;
}

export class PlayerDto {
  @ApiProperty({ example: 1 })
  id: number;
  @ApiProperty({ example: "Rei" })
  nickname: string;
  @ApiProperty({ example: false })
  ready: boolean;
}

@ApiTags('lobby')
@Controller('lobby')
export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {}

  @UseGuards(JwtAuthenticationGuard)
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
            value: { numPlayers: 4 } as CreateLobbyDto
        }
    }
})
  create(@Req() request: RequestWithUser, @Body() createLobbyDto: CreateLobbyDto) {
    createLobbyDto.hostId = request.user.id;
    return this.lobbyService.create(createLobbyDto);
  }
  
  @UseGuards(JwtAuthenticationGuard)
  @Post('join-lobby')
  @ApiOperation({ summary: "Enter the lobby" })
  @ApiOkResponse({ description: 'Enter the lobby has been made successfully.'})
  @ApiBadRequestResponse({ description: 'Enter the lobby cannot be made' })
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
  async joinLobby(@Req() request: RequestWithUser, @Body() createLobbyDto: CreateLobbyDto) {
    return this.lobbyService.joinLobby(request.user.id, createLobbyDto);
  }


  @UseGuards(JwtAuthenticationGuard, IsUserInLobbyGuard)
  @Post('exit')
  @ApiOperation({ summary: "Exit the lobby" })
  @ApiOkResponse({ description: 'Exit from the lobby was successfully completed.'})
  @ApiBadRequestResponse({ description: 'It is not possible to exit the lobby' })
  async exitLobby(@Req() request: RequestWithUser) {
    return this.lobbyService.exitLobby(request.user.id);
  }

  @UseGuards(JwtAuthenticationGuard, IsUserInLobbyGuard)
  @Get("hostId")
  @ApiOperation({ summary: "Get the ID of the lobby host" })
  @ApiOkResponse({ type: hostIdLobbyDto })
  @ApiBadRequestResponse({ description: "Lobby does not exist" })
  async getHostId(@Req() request: RequestWithUser){
    return this.lobbyService.getHostIdFromIdLobby(request.user.lobbyId);
  }

  @UseGuards(JwtAuthenticationGuard, IsUserInLobbyGuard)
  @UseGuards()
  @Get('players')
  @ApiOperation({ summary: 'Get list of players in the lobby' })
  @ApiOkResponse({ type: [PlayerDto] })
  async getPlayers(@Req() request: RequestWithUser){
    return this.lobbyService.getAllPlayersInLobby(request.user.lobbyId);
  }

  @UseGuards(JwtAuthenticationGuard, HostGuard)
  @Post('kick/:id')
  @ApiOperation({ summary: "Kick player from lobby" })
  @ApiOkResponse({ description: 'player has been removed.'})
  @ApiBadRequestResponse({ description: 'It is not possible to kick a player' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'There must be user ID that they want to kick',
    type: Number
  })
  async kickPlayer(@Param('id') id: string, @Req() request: RequestWithUser) {
    return this.lobbyService.kickUserFromLobby(+id, request.user.id);
  }
}
