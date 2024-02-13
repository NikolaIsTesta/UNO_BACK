import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsNumber} from 'class-validator'
export class CreateUserDto {
    @IsNotEmpty()
    @ApiProperty({ example: '1' })
    id:            number  
    @IsString()
    @ApiProperty({ example: 'Rei' })
    nickname?:      string
    lobbyId? :     number
    numberInTurn?:  number
    ready? : boolean
}
