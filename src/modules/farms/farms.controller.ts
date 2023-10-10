import { NextFunction, Request, Response } from 'express';

import { CreateFarmDto } from './dto/create-farm.dto';
import { FarmsService } from './farms.service';
import { UsersService } from 'modules/users/users.service';
import { EntityNotFoundError } from 'typeorm';
import { User } from 'modules/users/entities/user.entity';
import { SortColumnEnum, SortOrderEnum } from 'enums/farm.enum';
import { DefaultPaginationValues } from 'constants/pagination.constants';

export class FarmsController {
  private readonly farmService: FarmsService;
  private readonly userService: UsersService;

  constructor() {
    this.userService = new UsersService();
    this.farmService = new FarmsService();
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId: farmUserId } = req.body;

      const user = await this.userService.findOneBy({ id: farmUserId });

      if (!user) {
        throw new EntityNotFoundError(User, `userId: ${farmUserId}`);
      }

      const newFarm = {
        ...req.body,
        user,
      };

      const {
        id,
        name,
        address,
        coordinates,
        user: { id: userId },
        size,
        yield: farmYield,
      } = await this.farmService.createFarm(newFarm as CreateFarmDto);

      res.status(201).send({ id, name, address, coordinates, userId, size, farmYield });
    } catch (error) {
      next(error);
    }
  }

  public async fetch(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.body;
      const { limit = DefaultPaginationValues.limit, offset = DefaultPaginationValues.offset, sortOrder, sortColumn, outliers = 'false' } = req.query;

      let averageYield: number = 0;
      const outliersVal = outliers === 'true';

      const user = await this.userService.findOneBy({ id: userId });

      if (!user) {
        throw new EntityNotFoundError(User, `userId: ${userId}`);
      }

      if (outliersVal) {
        averageYield = await this.farmService.getAverageFarmYield();
      }

      const farms = await this.farmService.fetchFarms(
        parseInt(limit as string),
        parseInt(offset as string),
        sortOrder as SortOrderEnum,
        sortColumn as SortColumnEnum,
        outliersVal,
        averageYield,
      );
      res.status(200).send(farms);
    } catch (error) {
      next(error);
    }
  }
}
