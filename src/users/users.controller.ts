import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/authentication/jwt-authentication.guard';
import RequestWithUser from 'src/authentication/requestWithUser.interface';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: "Create new user" })
  @ApiCreatedResponse({ type: CreateUserDto })
  @ApiBadRequestResponse({ description: 'User doesnt created' })
  create() {
    return this.usersService.create();
  }

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
  @UseGuards(JwtAuthenticationGuard)
  @Patch('update-nick')
  update(@Req() request: RequestWithUser, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(request.user.id, updateUserDto);
  }


  // сваггеры
  @UseGuards(JwtAuthenticationGuard)
  @Patch('switch/ready')
  switchReadyField(@Req() request: RequestWithUser) {
    return this.usersService.updateFieldReady(request.user);
  }
}
