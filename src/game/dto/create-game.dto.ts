import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsJSON, IsNumber} from 'class-validator';

export class CreateGameDto {
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    id:                number
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    lobbyId:          number
    @IsJSON()
    @ApiProperty()
    deck: { color: string, value: string }[]
    @IsJSON()
    @ApiProperty()
    spentCards?: { color: string, value: string }[]
    @IsJSON()
    @ApiProperty()
    currentCards: { color: string, value: string }[]
}
