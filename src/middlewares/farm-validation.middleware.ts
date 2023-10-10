import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BadRequestError } from 'errors/errors';
import { NextFunction, Request, Response } from 'express';
import { CreateFarmDto } from 'modules/farms/dto/create-farm.dto';
import { FetchFarmQueryParams } from 'modules/farms/dto/fetch-farm.dto';

export const validateCreateFarmDto = async (req: Request, _: Response, next: NextFunction): Promise<void> => {
  const instance = plainToInstance(CreateFarmDto, req.body);
  const errors = await validate(instance);

  if (errors.length > 0) {
    const dtoErrors = errors.map(error => (Object as any).values(error.constraints)).join(', ');
    return next(new BadRequestError(dtoErrors));
  }

  next();
};

export const validateFetchFarms = async (req: Request, _: Response, next: NextFunction): Promise<void> => {
  const instance = plainToInstance(FetchFarmQueryParams, req.query, {
    enableImplicitConversion: true,
    exposeDefaultValues: true,
  });

  const errors = await validate(instance);

  if (errors.length > 0) {
    const dtoErrors = errors.map(error => (Object as any).values(error.constraints)).join(', ');
    return next(new BadRequestError(dtoErrors));
  }

  next();
};
