import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GameService } from 'src/game/game.service';

@Injectable()
export default class NotUnoMove implements CanActivate {
    constructor(private readonly gameService: GameService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const { user } = context.switchToHttp().getRequest();
        if (!user) {
            return false;
        }
        const lobbyId = user.lobbyId;
        const game = await this.gameService.findOne(lobbyId);
        if (!game) {
            return false;
        }
        const UNO = !game.UNO;
        return UNO;
    }
}
