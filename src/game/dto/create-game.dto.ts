import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsJSON, IsNumber, IsBoolean} from 'class-validator';
import { CreateCardDto } from 'src/card/dto/create-card.dto';

export class CreateGameDto {
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    @ApiProperty({ example: 1 })
    id?: number
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    @ApiProperty({ example: 1 })
    lobbyId: number
    @IsJSON()
    deck?: { color: string, value: string }[]
    @IsJSON()
    spentCards?: { color: string, value: string }[]
    @IsNumber()
    currentPlayer?: number
    @IsJSON()
    @ApiProperty()
    currentCards?: { color: string, value: string }[]
    @IsBoolean()
    direction?: boolean
    @IsBoolean()
    @ApiProperty()
    UNO?: boolean
}
