import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiProperty, ApiTags } from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/authentication/jwt-authentication.guard';
import RequestWithUser from 'src/authentication/requestWithUser.interface';
export class stateUserDto {
  @ApiProperty({ example: true })
  ready : boolean
}
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: "Create new user" })
  @ApiCreatedResponse({ type: CreateUserDto })
  @ApiBadRequestResponse({ description: 'User doesnt created' })
  create() {
    return this.usersService.create();
  }

  @UseGuards(JwtAuthenticationGuard)
  @Patch('update-nick')
  @ApiOperation({ summary: "Edit nickname" })
  @ApiOkResponse({ type: CreateUserDto })
  @ApiBadRequestResponse({ description: 'Nickname doesnt edited' })
  @ApiBody({   type: CreateUserDto,
    description: "Edit nickname",
    examples: {
        a: {
            summary: "New nickname",
            description: "Example of editing a nickname",
            value: {nickname: "ReiFanta"} as CreateUserDto
        }
    }})
  update(@Req() request: RequestWithUser, @Body() nickname: string) {
    return this.usersService.updateNickname(request.user.id, nickname);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Patch('switch/ready')
  @ApiOperation({ summary: "Switch the player's status in the lobby to ready/not ready" })
  @ApiOkResponse({ type: stateUserDto })
  @ApiBadRequestResponse({ description: 'Bad request' })
  switchReadyField(@Req() request: RequestWithUser) {
    return this.usersService.updateFieldReady(request.user.id);
  }
}
