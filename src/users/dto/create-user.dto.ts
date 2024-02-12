import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsNumber} from 'class-validator'
export class CreateUserDto {
    @IsNotEmpty()
    @ApiProperty()
    id:            number  
    @IsString() 
    nickname?:      string
    lobbyId? :     number
    numberInTurn?:  number
    ready? : boolean
}
