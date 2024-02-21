import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { LobbyService } from 'src/lobby/lobby.service';
import { UsersService } from "src/users/users.service"

@Injectable()
export default class IsUserInLobbyGuard  implements CanActivate {
    constructor(private readonly usersService: UsersService, private readonly lobbyService: LobbyService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const { user } = context.switchToHttp().getRequest();
        if (!user) {
            return false;
        }
        const userId = user.id;
        const lobbyId = user.lobbyId;
        if (!lobbyId) {
            return false;
        }
        return true;
    }
}
