import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BadRequestError } from 'errors/errors';
import { NextFunction, Request, Response } from 'express';
import { LoginUserDto } from 'modules/auth/dto/login-user.dto';

export const validateAuthLoginDto = async (req: Request, _: Response, next: NextFunction): Promise<void> => {
  const instance = plainToInstance(LoginUserDto, req.body);
  const errors = await validate(instance);
  if (errors.length > 0) {
    const dtoErrors = errors.map(error => (Object as any).values(error.constraints)).join(', ');
    return next(new BadRequestError(dtoErrors));
  }

  next();
};

