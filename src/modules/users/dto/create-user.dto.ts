import { IsEmail, IsLatLong, IsNotEmpty, IsString } from 'class-validator';

/**
 * @openapi
 * components:
 *  schemas:
 *    CreateUserDto:
 *      type: object
 *      required:
 *        - email
 *        - password
 *        - coordinates
 *        - address
 *      properties:
 *        email:
 *          type: string
 *          default: example@app.com
 *        password:
 *          type: string
 *          default: password
 *        coordinates:
 *          type: string
 *          default: 52.355822,4.911021
 *        address:
 *          type: string
 *          default: Wibautstraat, 1091 GN Amsterdam, Netherlands
 */

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsNotEmpty()
  public password: string;

  @IsLatLong()
  @IsNotEmpty()
  public coordinates: string;

  @IsString()
  @IsNotEmpty()
  public address: string;
}
