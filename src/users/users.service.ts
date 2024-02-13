import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService) {}
    
  async create() { 
  let newUser = await this.prismaService.user.create({ 
    data: {}, 
  }); 
  newUser.nickname = "Игрок" + newUser.id.toString();
  newUser = await this.update(newUser.id, newUser);
  return { id: newUser.id, name: newUser.nickname };;
}

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.prismaService.user.update({
      where: { id: id },
      data: updateUserDto,
    });
  }
  

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async getById(id: number) {
    const user = await this.prismaService.user.findFirst({ where: {id} });
    if (user) {
      return user;
    }
    throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND);
  }

  async updateFieldReady(user: CreateUserDto) {
    if (user.lobbyId) {
      const state = !user.ready;
      return await this.prismaService.user.update({
        where: { id: user.id },
        data: { ready: state },
        select: {
          ready: true
        }
      });
    } else {
      return "The user is not in the lobby";
    }
  }
}
