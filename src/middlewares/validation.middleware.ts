import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BadRequestError } from 'errors/errors';
import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from 'modules/users/dto/create-user.dto';

export const validateUserDto = async (req: Request, _: Response, next: NextFunction): Promise<void> => {
  const plain = plainToInstance(CreateUserDto, req.body);
  const errors = await validate(plain);
  if (errors.length > 0) {
    const dtoErrors = errors.map(error => (Object as any).values(error.constraints)).join(', ');
    return next(new BadRequestError(dtoErrors));
  }

  next();
};
