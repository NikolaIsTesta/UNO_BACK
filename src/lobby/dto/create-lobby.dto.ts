import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber} from 'class-validator';

export class CreateLobbyDto {
    @IsNumber()
    @ApiProperty()
    id: number;
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    code: string;
    @IsNumber()
    @ApiProperty()
    numPlayers: number;
    @IsNumber()
    @ApiProperty()
    hostId: number;
}