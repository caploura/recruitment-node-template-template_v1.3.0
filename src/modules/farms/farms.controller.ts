import { NextFunction, Response } from 'express';

import { CreateFarmDto } from './dto/create-farm.dto';
import { FarmsService } from './farms.service';
import { DefaultPaginationValues } from 'constants/pagination.constants';
import { ExtendedRequest } from 'middlewares/auth.middleware';

export class FarmsController {
  private readonly farmService: FarmsService;

  constructor() {
    this.farmService = new FarmsService();
  }

  public async create(req: ExtendedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;

      const newFarm = {
        ...req.body,
        user,
      };

      const { id, name, address, coordinates, size, yield: farmYield } = await this.farmService.createFarm(newFarm as CreateFarmDto);

      res.status(201).send({ id, name, address, coordinates, userId: user.id, size, farmYield });
    } catch (error) {
      next(error);
    }
  }

  public async fetch(req: ExtendedRequest, res: Response, next: NextFunction) {
    try {
      const { id: userId } = req.user;
      const { limit = DefaultPaginationValues.limit, offset = DefaultPaginationValues.offset, sortOrder, sortColumn, outliers = 'false' } = req.query;

      const result = await this.farmService.fetchFarmsByParams(
        userId as string,
        limit as number,
        offset as number,
        sortOrder as string,
        sortColumn as string,
        (outliers as string).toLowerCase() === 'true',
      );

      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  }
}
