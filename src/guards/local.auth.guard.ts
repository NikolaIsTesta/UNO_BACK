import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import TokenPayload from 'src/authentication/tokenPayload.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class LocalAuthGuard implements CanActivate {
constructor(private readonly jwtService: JwtService,
  private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
      const { cookies } = context.switchToHttp().getRequest();
      const token = cookies.Authentication;

    if (!token) {
      return true;
    }

    try {
      const payload: TokenPayload = this.jwtService.verify(token);
      return false;
    } catch (e) {
      return true;
    }
  }
}
