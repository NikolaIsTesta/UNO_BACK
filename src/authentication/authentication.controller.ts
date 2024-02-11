import { Body, Req, Controller, HttpCode, Post, UseGuards, Res, Get, Param } from '@nestjs/common';
import { Response } from 'express';
import { AuthenticationService } from './authentication.service';
import RequestWithUser from './requestWithUser.interface';
import JwtAuthenticationGuard from './jwt-authentication.guard';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
 
@ApiTags('auth')
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

@HttpCode(200)
@Post('log-in/:id')
@ApiOperation({ summary: "Log in" })
@ApiOkResponse({ description: 'you have successfully logged in'})
@ApiBadRequestResponse({ description: 'Unable to log in' })
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
async logOut (@Req()request:RequestWithUser,@Res() response: Response) {
  response.setHeader('Set-Cookie', this.authenticationService.getCookieForLogOut());
  return response.sendStatus(200);
}


@UseGuards(JwtAuthenticationGuard)
@Get()
authenticate(@Req() request: RequestWithUser) {
  const user = request.user;
  return user;
}
}