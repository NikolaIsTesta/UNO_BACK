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
  @ApiParam({
    name: 'id',
    required: true,
    description: 'There must be an ID of an existing user',
    type: Number
  })
  @ApiBody({   type: CreateUserDto,
    description: "Edit nickname",
    examples: {
        a: {
            summary: "New nickname",
            description: "Example of editing a nickname",
            value: {nickname: "ReiFanta"} as CreateUserDto
        }
    }})
  @Patch('chabge-nick:id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }


  // сваггеры
  @UseGuards(JwtAuthenticationGuard)
  @Patch('change-ready')
  switchReadyField(@Req() request: RequestWithUser) {
    return this.usersService.updateFieldReady(request.user);
  }
}
