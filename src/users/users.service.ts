import { Injectable } from '@nestjs/common';
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
  return newUser;
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
}
