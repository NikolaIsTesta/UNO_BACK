import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GameService } from 'src/game/game.service';
import { UsersService } from "src/users/users.service"

@Injectable()
export default class PlayerTurnGuard implements CanActivate {
    constructor(private readonly usersService: UsersService, private readonly gameService: GameService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const { user } = context.switchToHttp().getRequest();
        if (!user) {
            return false;
        }
        const userId = user.id;
        const lobbyId = user.lobbyId;
        const game = await this.gameService.findOne(lobbyId);
        if (!game) {
            return false;
        }
        const currentPlayerId = await this.gameService.getCurrentPlayerId(lobbyId, game.currentPlayer);
        return currentPlayerId === userId;
    }
}
