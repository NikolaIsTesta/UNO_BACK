import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsJSON, IsNumber} from 'class-validator';

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
    deck: { color: string, value: string }[]
    @IsJSON()
    spentCards?: { color: string, value: string }[]
    @IsJSON()
    @ApiProperty()
    currentCards?: { color: string, value: string }[]
}
