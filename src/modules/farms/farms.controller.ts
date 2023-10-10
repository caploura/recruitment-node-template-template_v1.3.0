import { NextFunction, Request, Response } from 'express';

import { CreateFarmDto } from './dto/create-farm.dto';
import { FarmsService } from './farms.service';
import { UsersService } from 'modules/users/users.service';
import { EntityNotFoundError } from 'typeorm';
import { User } from 'modules/users/entities/user.entity';
import { SortColumnEnum, SortOrderEnum } from 'enums/farm.enum';
import { DefaultPaginationValues } from 'constants/pagination.constants';
import { DistanceService } from 'modules/distance/distance.service';
import { DistanceUnitsEnum } from 'enums/distance.enum';
import { Farm } from './entities/farm.entity';

export class FarmsController {
  private readonly farmService: FarmsService;
  private readonly userService: UsersService;
  private readonly distanceService: DistanceService;

  constructor() {
    this.userService = new UsersService();
    this.farmService = new FarmsService();
    this.distanceService = new DistanceService();
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
        limit as number,
        offset as number,
        sortOrder as SortOrderEnum,
        sortColumn as SortColumnEnum,
        outliersVal,
        averageYield,
      );

      type ResultType = Farm & { distance: number };

      let result: ResultType[] = [];
      if (farms.length > 0) {
        const distance = await this.distanceService.getDistanceBetweenTwoPointsFromGoogleApi({
          origins: [user.coordinates],
          destinations: farms.map(f => f.coordinates),
          units: DistanceUnitsEnum.metric,
        });

        result = farms.map((f, i) => {
          return { ...f, distance: distance.rows[0].elements[i].distance.value };
        });

        if (sortColumn === SortColumnEnum.DISTANCE) {
          result = result.sort((a, b) => {
            if (sortOrder === SortOrderEnum.ASC) return b.distance - a.distance;
            return a.distance - b.distance;
          });
        }
      }

      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  }
}
