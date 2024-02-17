import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { LobbyService } from 'src/lobby/lobby.service';
import { UsersService } from "src/users/users.service"

@Injectable()
export default class HostGuard implements CanActivate {
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
        return lobby.hostId === userId;
    }
}
