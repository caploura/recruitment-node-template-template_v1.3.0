import { NextFunction, Response } from 'express';

import { ExtendedFarmWithUser, FarmsService } from './farms.service';
import { DefaultPaginationValues } from 'constants/pagination.constants';
import { ExtendedRequest } from 'middlewares/auth.middleware';
import { User } from 'modules/users/entities/user.entity';

export class FarmsController {
  private readonly farmService: FarmsService;

  constructor() {
    this.farmService = new FarmsService();
  }

  public async create(req: ExtendedRequest, res: Response, next: NextFunction) {
    try {
      const user: User = req.user;

      const newFarm: ExtendedFarmWithUser = {
        ...req.body,
        user,
      };

      const { id, name, address, coordinates, size, yield: farmYield } = await this.farmService.createFarm(newFarm);

      res.status(201).send({ id, name, address, coordinates, userId: user.id, size, farmYield });
    } catch (error) {
      next(error);
    }
  }

  public async fetch(req: ExtendedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const { limit = DefaultPaginationValues.limit, offset = DefaultPaginationValues.offset, sortOrder, sortColumn, outliers = 'false' } = req.query;

      const result = await this.farmService.fetchFarmsByParams(
        user,
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
