import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsNumber, IsJSON} from 'class-validator'

export class CreateUserDto {
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ example: 1 })
    id:            number  
    @IsString()
    @ApiProperty({ example: 'Rei' })
    nickname?:      string
    lobbyId? :     number
    numberInTurn?:  number
    ready? : boolean
    @IsJSON()
    cards?: { color: string, value: string }[]
}
