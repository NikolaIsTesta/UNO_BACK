import { Body, Req, Controller, HttpCode, Post, UseGuards, Res, Get, Param } from '@nestjs/common';
import { Response } from 'express';
import { AuthenticationService } from './authentication.service';
import RequestWithUser from './requestWithUser.interface';
import JwtAuthenticationGuard from './jwt-authentication.guard';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiProperty, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from 'src/guards/local-auth.guard';
export class authUserDto {
  @ApiProperty({ example: 1 })
  id:            number  
  @ApiProperty({ example: 'Rei' })
  nickname:      string
  @ApiProperty({ example: 1 })
  lobbyId:     number
  @ApiProperty({ example: 1 })
  numberInTurn:  number
  @ApiProperty({ example: true })
  ready: boolean
  @ApiProperty()
  cards: { color: string, value: string }[]
}

@ApiTags('auth')
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('log-in/:id')
  @ApiOperation({ summary: "Log in" })
  @ApiOkResponse({ description: 'you have successfully logged in'})
  @ApiBadRequestResponse({ description: 'Wrong credentials provided' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'There must be a ID user who wants to log in',
    type: Number
  })
  async logIn(@Param('id') id: string, @Req() request: RequestWithUser, @Res() response: Response) {
    const { user } = request
    const cookie = await this.authenticationService.getCookieWithJwtToken(+id)
    request.res.set('Set-Cookie', cookie)
    return request.res.send(user)
  }


  @UseGuards(JwtAuthenticationGuard)
  @Post('log-out')
  @ApiOperation({ summary: "Log out" })
  @ApiOkResponse({ description: 'OK'})
  @ApiBadRequestResponse({ description: 'An error occurred when logging out of the account' })
  async logOut (@Req()request:RequestWithUser,@Res() response: Response) {
    response.setHeader('Set-Cookie', this.authenticationService.getCookieForLogOut());
    return response.sendStatus(200);
  }


  @UseGuards(JwtAuthenticationGuard)
  @Get()
  @ApiOperation({ summary: "Show information about an authorized user" })
  @ApiOkResponse({ type: authUserDto })
  @ApiBadRequestResponse({ description: 'Error when issuing data about an authorized user' })
  authenticate(@Req() request: RequestWithUser) {
    const user = request.user;
    return user;
  }
}