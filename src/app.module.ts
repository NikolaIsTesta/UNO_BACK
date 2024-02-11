import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { LobbyModule } from './lobby/lobby.module';
import { GameModule } from './game/game.module';
import { PrismaModule } from './prisma/prisma.module';
import { CardModule } from './card/card.module';
import { AuthenticationModule } from './authentication/authentication.module';
//import * as Joi from '@hapi/joi';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UsersModule, LobbyModule, GameModule, PrismaModule, CardModule, AuthenticationModule, 
    //ConfigModule.forRoot({
   // validationSchema: Joi.object({
    //JWT_SECRET: Joi.string().required(),
    //JWT_EXPIRATION_TIME: Joi.string().required(),
    //})
  //})
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
