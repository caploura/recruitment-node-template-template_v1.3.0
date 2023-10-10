import { Type } from 'class-transformer';
import { IsBooleanString, IsEnum, IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { DefaultPaginationValues } from 'constants/pagination.constants';
import { SortColumnEnum, SortOrderEnum } from 'enums/farm.enum';

/**
 * @openapi
 * components:
 *  schemas:
 *    parameters:
 *     - in: query
 *       name: limit
 *       schema:
 *        type: integer
 *     - in: query
 *       name: offset
 *       schema:
 *        type: integer
 */
export class FetchFarmQueryParams {
  @IsOptional()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  @IsNumber()
  limit: number = DefaultPaginationValues.limit;

  @IsOptional()
  @Min(0)
  @Type(() => Number)
  @IsNumber()
  offset: number = DefaultPaginationValues.offset;

  @IsEnum(SortOrderEnum)
  @IsNotEmpty()
  sortOrder: string = SortOrderEnum.DESC;

  @IsEnum(SortColumnEnum)
  @IsNotEmpty()
  sortColumn: string = SortColumnEnum.NAME;

  @IsOptional()
  @IsBooleanString()
  outliers: string = 'false';
}

export class FetchFarmResponseDto {
  name: string;
  address: string;
  coordinates: string;
  size: number;
  yield: number;
  owner?: string;
  createdAt?: Date;
  distance: number;
}
