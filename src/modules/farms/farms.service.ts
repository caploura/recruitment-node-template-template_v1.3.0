import { Repository } from 'typeorm';
import dataSource from 'orm/orm.config';
import { Farm } from './entities/farm.entity';
import { CreateFarmDto } from './dto/create-farm.dto';

export class FarmsService {
  private readonly farmsRepository: Repository<Farm>;

  constructor() {
    this.farmsRepository = dataSource.getRepository(Farm);
  }

  public async createFarm(data: CreateFarmDto): Promise<Farm> {
    return this.farmsRepository.save(data);
  }
}
