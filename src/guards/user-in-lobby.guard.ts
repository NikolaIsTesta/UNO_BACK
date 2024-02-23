import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export default class IsUserInLobbyGuard  implements CanActivate {
    constructor() {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const { user } = context.switchToHttp().getRequest();
        if (!user) {
            return false;
        }
        const lobbyId = user.lobbyId;
        if (!lobbyId) {
            return false;
        }
        return true;
    }
}
