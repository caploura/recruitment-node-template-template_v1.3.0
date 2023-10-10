import { IsLatLong, IsNotEmpty, IsEnum, IsArray } from 'class-validator';
import { DistanceUnitsEnum } from 'enums/distance.enum';

export class FetchDistanceRequestDto {
  @IsArray()
  @IsLatLong()
  @IsNotEmpty()
  destinations: string[];

  @IsArray()
  @IsLatLong()
  @IsNotEmpty()
  origins: string[];

  @IsEnum(DistanceUnitsEnum)
  @IsNotEmpty()
  units: string;
}

type TextValElement = {
  text: string;
  value: number;
};

type Element = {
  distance: TextValElement;
  duration: TextValElement;
  status: string;
};

type Row = {
  elements: Element[];
};

export class FetchDistanceResponseDto {
  destination_addresses: string[];
  origin_addresses: string[];
  rows: Row[];
}
