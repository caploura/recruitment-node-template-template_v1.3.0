import { EntityNotFoundError, Repository } from 'typeorm';
import dataSource from 'orm/orm.config';
import { Farm } from './entities/farm.entity';
import { CreateFarmDto } from './dto/create-farm.dto';
import { SortColumnEnum, SortOrderEnum } from 'enums/farm.enum';
import { DefaultOutlierPercentage } from 'constants/outliers.constants';
import { User } from 'modules/users/entities/user.entity';
import { UsersService } from 'modules/users/users.service';
import { DistanceService } from 'modules/distance/distance.service';
import { DistanceUnitsEnum } from 'enums/distance.enum';
import { FetchFarmResponseDto } from './dto/fetch-farm.dto';

export type ExtendedFarm = CreateFarmDto & {
  userId: any
}

export class FarmsService {
  private readonly farmsRepository: Repository<Farm>;
  private readonly usersService: UsersService;
  private readonly distanceService: DistanceService;

  constructor() {
    this.farmsRepository = dataSource.getRepository(Farm);
    this.usersService = new UsersService();
    this.distanceService = new DistanceService();
  }

  public async createFarm(data: CreateFarmDto): Promise<Farm> {
    return this.farmsRepository.save(data);
  }

  private async queryFarmsWithOwner(
    limit: number,
    offset: number,
    sortOrder: SortOrderEnum = SortOrderEnum.DESC,
    sortColumn: SortColumnEnum,
    outliers: boolean,
    averageYield: number,
  ): Promise<Farm[]> {
    let sortColName: string;
    if (sortColumn === SortColumnEnum.DATE) {
      sortColName = 'farm.createdAt';
    } else {
      sortColName = 'farm.name';
    }

    let query = this.farmsRepository
      .createQueryBuilder('farm')
      .select('farm.name, farm.address, farm.coordinates, farm.size, farm.yield, user.email AS owner, farm.createdAt');

    if (outliers) {
      query = query.where('farm.yield > :minYield AND farm.yield < :maxYield', {
        minYield: averageYield * (1 - DefaultOutlierPercentage),
        maxYield: averageYield * (1 + DefaultOutlierPercentage),
      });
    }

    query = query.innerJoin('farm.user', 'user').orderBy(sortColName, SortOrderEnum[sortOrder]).limit(limit).offset(offset);

    return query.execute();
  }

  private async getAverageFarmYield(): Promise<number> {
    const avg = (await this.farmsRepository.average('yield')) || 0;
    return avg;
  }

  public async fetchFarmsByParams(
    userId: string,
    limit: number,
    offset: number,
    sortOrder: string,
    sortColumn: string,
    outliers: boolean,
  ): Promise<FetchFarmResponseDto[]> {
    let averageYield: number = 0;

    const user = await this.usersService.findOneBy({ id: userId });
    
    if (!user || !userId) {
      throw new EntityNotFoundError(User, `userId: ${userId}`);
    }

    if (outliers) {
      averageYield = await this.getAverageFarmYield();
    }

    const farms = await this.queryFarmsWithOwner(limit, offset, sortOrder as SortOrderEnum, sortColumn as SortColumnEnum, outliers, averageYield);

    let result: FetchFarmResponseDto[] = [];
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

    return result;
  }
}
