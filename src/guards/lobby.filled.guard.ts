import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { LobbyService } from 'src/lobby/lobby.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from "src/users/users.service"

@Injectable()
export default class LobbyFilledGuard implements CanActivate {
    constructor(private readonly usersService: UsersService, private readonly lobbyService: LobbyService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const { user, params } = context.switchToHttp().getRequest();
        if (!user) {
            return false;
        }
        const userId = user.id;
        const lobbyId = user.lobbyId;
        const lobby = await this.lobbyService.findOne(lobbyId);
        if (!lobby) {
            return false;
        }
        const lobbyNumberPlayer = lobby.numPlayers;
        const userFromLobby = await this.lobbyService.getAllPlayersInLobby(lobbyId) as CreateUserDto[];
        const numberUserFromLobby = userFromLobby.length;
        const usersReadyField = userFromLobby.map(user => user.ready);
        const anyNotReadyPlayer = usersReadyField.includes(false);
        if (lobbyNumberPlayer !== numberUserFromLobby) {
            throw new HttpException('Not all players are ready', HttpStatus.FORBIDDEN);
        }
        else 
            if (anyNotReadyPlayer) {
            throw new HttpException('The lobby is not full', HttpStatus.FORBIDDEN);
        }
        return true;
    }
}
