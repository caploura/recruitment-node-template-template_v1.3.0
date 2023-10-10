import { IsBooleanString, IsEnum, IsNotEmpty, IsNumberString, IsOptional, ValidateIf } from 'class-validator';
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
  @IsNumberString()
  limit: string = DefaultPaginationValues.limit;

  @ValidateIf((data) => data.offset)
  @IsOptional()
  @IsNumberString()
  offset: string = DefaultPaginationValues.offset;

  @IsEnum(SortOrderEnum)
  @IsNotEmpty()
  sortOrder: string;
  
  @IsEnum(SortColumnEnum)
  @IsNotEmpty()
  sortColumn: string;

  @IsOptional()
  @IsBooleanString()
  outliers: string = 'false'
}
