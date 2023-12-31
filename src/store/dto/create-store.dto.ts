import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateStoreDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  phone: string;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  number: string;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  street: string;

  @ApiProperty()
  @IsString()
  @MaxLength(150)
  city: string;

  @ApiProperty()
  @IsString()
  @MaxLength(5)
  zip: string;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  @IsOptional()
  web: string;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  @IsOptional()
  map: string;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty()
  @IsOptional()
  picture_id: number | null;
}
