import { Injectable } from '@nestjs/common';
import { CreateLobbyDto } from './dto/create-lobby.dto';
import { UpdateLobbyDto } from './dto/update-lobby.dto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class LobbyService {
  constructor(
    private readonly prismaService: PrismaService,
  ) {}
    async create(createLobbyDto: CreateLobbyDto) {
      let isUniqueCode = false;
      let code ='';
      while (!isUniqueCode)
      {
        code = uuidv4().slice(0, 4);
        const existingLobby = await this.prismaService.lobby.findFirst({ where: {code} });
        if (!existingLobby)
          {
            isUniqueCode = true;
            createLobbyDto.code = code;
          }
      }
      const newLobby = await this.prismaService.lobby.create({
        data: createLobbyDto,
      });
      return newLobby;
  }

    async joinLobby(id: number, createLobbyDto: CreateLobbyDto){
      let code = createLobbyDto.code;
      const existingLobby = await this.prismaService.lobby.findFirst({ where: {code} });
      if (existingLobby)
      {
        const count = await this.prismaService.user.count({ where: {lobbyId: existingLobby.id} })
        if (count < existingLobby.numPlayers){
          await this.prismaService.user.update({
            where: { id: id },
            data:  { lobbyId: existingLobby.id},
          });
          return "You have entered the lobby";
        }
        else
          return "There is not enough space in the lobby"
      }
      return "The lobby does not exist";
    }

    async exitLobby(id: number){
      const exitingUser = await this.prismaService.user.findFirst({ where: {id:id}});
      const lobby = await this.prismaService.lobby.findFirst({ where:{ id: exitingUser.lobbyId } })
      if (lobby.hostId == id) {
        await this.prismaService.lobby.delete({ where:{ id: lobby.id }})
        return "The host leaves the lobby. The lobby has been removed"
      }
      else {
        await this.prismaService.user.update({
          where: { id: id },
          data:  { lobbyId: null }
        })
        return "You left the lobby"
      }
    }

}
