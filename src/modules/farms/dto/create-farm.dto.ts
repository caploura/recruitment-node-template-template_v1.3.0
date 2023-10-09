import { IsLatLong, IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

/**
 * @openapi
 * components:
 *  schemas:
 *    CreateFarmDto:
 *      type: object
 *      required:
 *        - name
 *        - coordinates
 *        - address
 *        - userId
 *        - size
 *        - yield
 *      properties:
 *        name:
 *          type: string
 *          default: farm name
 *        coordinates:
 *          type: string
 *          default: 52.355822,4.911021
 *        address:
 *          type: string
 *          default: Some street name, 0000 Somewhere
 *        userId:
 *          type: string
 *          default: 28221216-5983-454f-85e2-e1a4669e50ab
 *        size:
 *          type: number
 *          default: 25.8
 *        yield:
 *          type: number
 *          default: 8.5
 */

export class CreateFarmDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsLatLong()
  @IsNotEmpty()
  public coordinates: string;

  @IsString()
  @IsNotEmpty()
  public address: string;

  @IsUUID(4)
  @IsNotEmpty()
  public userId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  size: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  yield: number;
}
