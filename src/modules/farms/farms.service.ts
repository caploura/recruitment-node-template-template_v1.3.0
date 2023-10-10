import { Repository } from 'typeorm';
import dataSource from 'orm/orm.config';
import { Farm } from './entities/farm.entity';
import { CreateFarmDto } from './dto/create-farm.dto';
import { SortColumnEnum, SortOrderEnum } from 'enums/farm.enum';
import { DefaultOutlierPercentage } from 'constants/outliers.constants';

export class FarmsService {
  private readonly farmsRepository: Repository<Farm>;

  constructor() {
    this.farmsRepository = dataSource.getRepository(Farm);
  }

  public async createFarm(data: CreateFarmDto): Promise<Farm> {
    return this.farmsRepository.save(data);
  }

  public async fetchFarms(
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
      .select('farm.name, farm.address, farm.size, farm.yield, user.email AS owner, farm.createdAt');

    if (outliers) {
      query = query.where('farm.yield > :minYield AND farm.yield < :maxYield', {
        minYield: averageYield * (1 - DefaultOutlierPercentage),
        maxYield: averageYield * (1 + DefaultOutlierPercentage),
      });
    }

    query = query.innerJoin('farm.user', 'user').orderBy(sortColName, SortOrderEnum[sortOrder]).limit(limit).offset(offset);

    return query.execute();
  }

  public async getAverageFarmYield(): Promise<number> {
    const avg = (await this.farmsRepository.average('yield')) || 0;
    return avg;
  }
}
