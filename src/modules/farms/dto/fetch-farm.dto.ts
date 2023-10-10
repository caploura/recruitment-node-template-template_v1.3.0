import { Type } from 'class-transformer';
import { IsBooleanString, IsEnum, IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { DefaultPaginationValues } from 'constants/pagination.constants';
import { SortColumnEnum, SortOrderEnum } from 'enums/farm.enum';

/**
 * @openapi
 * components:
 *  schemas:
 *    FetchClassQueryParams:
 *      type: query
 *      required:
 *        - limit
 *        - offset
 *      properties:
 *        limit:
 *          type: number
 *          default: example@app.com
 *        offset:
 *          type: number
 *          default: password
 */
export class FetchClassQueryParams {
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
  sortOrder: string;

  @IsEnum(SortColumnEnum)
  @IsNotEmpty()
  sortColumn: string;

  @IsOptional()
  @IsBooleanString()
  outliers: string = 'false';
}
