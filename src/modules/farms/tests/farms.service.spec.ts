import { faker } from '@faker-js/faker';
import { CreateFarmDto } from '../dto/create-farm.dto';
import { FarmsService } from '../farms.service';
import { User } from 'modules/users/entities/user.entity';
import ds from 'orm/orm.config';
import { disconnectAndClearDatabase } from 'helpers/utils';
import { UsersService } from 'modules/users/users.service';
import { DistanceService } from 'modules/distance/distance.service';
import { mockedDistanceApiResponse } from 'modules/distance/tests/mocks/distance.mock';
import { mockedAverage, mockedFarmWithOwner } from './mocks/farms.mock';
import { SortColumnEnum, SortOrderEnum } from 'enums/farm.enum';
import { DefaultPaginationValues } from 'constants/pagination.constants';
import { DistanceUnitsEnum } from 'enums/distance.enum';

describe('FarmsService', () => {
  let farmsService: FarmsService;
  let usersService: UsersService;
  let user: User;
  let newFarm: CreateFarmDto;

  let mockDistanceFunc: jest.SpyInstance;
  let mockQueryFarmsWithOwner: jest.SpyInstance;
  let mockQueryYieldAverage: jest.SpyInstance;

  beforeAll(async () => {
    await ds.initialize();
    farmsService = new FarmsService();
    usersService = new UsersService();

    const email = faker.internet.exampleEmail();
    const address = faker.location.streetAddress();
    const coordinates = `${faker.location.latitude()},${faker.location.longitude()}`;

    const { id } = await usersService.createUser({
      email,
      address,
      coordinates,
      password: faker.word.words(10),
    });

    user = {
      id,
      email: email,
      address: address,
      coordinates: coordinates,
      hashedPassword: faker.word.words(10),
      createdAt: faker.date.recent(),
      updatedAt: faker.date.recent(),
    };
  });

  afterAll(async () => {
    await disconnectAndClearDatabase(ds);
  });

  describe('.createFarm', () => {
    newFarm = {
      name: faker.word.words(3),
      coordinates: `${faker.location.latitude()},${faker.location.longitude()}`,
      address: faker.location.streetAddress(),
      size: parseFloat(faker.number.float({ min: 20, max: 100 }).toFixed(2)),
      yield: parseFloat(faker.number.float({ min: 20, max: 100 }).toFixed(2)),
    };

    it('should create a farm associated with the given user', async () => {
      const result = await farmsService.createFarm({ ...newFarm, user });

      expect(result).toBeDefined();
      expect(result.name).toStrictEqual(newFarm.name);
      expect(result.address).toStrictEqual(newFarm.address);
      expect(result.coordinates).toStrictEqual(newFarm.coordinates);
      expect(result.user.id).toStrictEqual(user.id);
    });
  });

  describe('.fetchFarmsByParams', () => {
    const { limit, offset } = DefaultPaginationValues;

    let mockedFarms = mockedFarmWithOwner();
    
    beforeEach(() => {
      jest.resetAllMocks();

      mockDistanceFunc = jest.spyOn(DistanceService.prototype, 'getDistanceBetweenTwoPointsFromGoogleApi');
      mockDistanceFunc.mockResolvedValue(mockedDistanceApiResponse());

      mockQueryFarmsWithOwner = jest.spyOn(FarmsService.prototype, 'queryFarmsWithOwner');
      mockQueryFarmsWithOwner.mockResolvedValueOnce(mockedFarms);

      mockQueryYieldAverage = jest.spyOn(FarmsService.prototype, 'getAverageFarmYield');
      mockQueryYieldAverage.mockResolvedValueOnce(mockedAverage);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return farms together with the distance from the requesting user', async () => {
      const result = await farmsService.fetchFarmsByParams(user, limit, offset, SortOrderEnum.DESC, SortColumnEnum.NAME, false);

      expect(mockQueryFarmsWithOwner).toHaveBeenCalledTimes(1);
      expect(mockQueryFarmsWithOwner).toHaveBeenCalledWith(limit, offset, SortOrderEnum.DESC, SortColumnEnum.NAME, false, 0);

      expect(mockDistanceFunc).toHaveBeenCalledTimes(1);
      expect(mockDistanceFunc).toHaveBeenCalledWith({
        origins: [user.coordinates],
        destinations: mockedFarms.map(f => f.coordinates),
        units: DistanceUnitsEnum.metric,
      });

      expect(mockQueryYieldAverage).toHaveBeenCalledTimes(0);

      expect(result).toBeDefined();
      expect(result.length).toBe(3); // Number of mocked farms
    });

    it('should return farms outliers with the distance from the requesting user', async () => {
      const result = await farmsService.fetchFarmsByParams(user, limit, offset, SortOrderEnum.DESC, SortColumnEnum.NAME, true);

      expect(mockQueryFarmsWithOwner).toHaveBeenCalledTimes(1);
      expect(mockQueryFarmsWithOwner).toHaveBeenCalledWith(limit, offset, SortOrderEnum.DESC, SortColumnEnum.NAME, true, mockedAverage);

      expect(mockDistanceFunc).toHaveBeenCalledTimes(1);
      expect(mockDistanceFunc).toHaveBeenCalledWith({
        origins: [user.coordinates],
        destinations: mockedFarms.map(f => f.coordinates),
        units: DistanceUnitsEnum.metric,
      });

      expect(mockQueryYieldAverage).toHaveBeenCalledTimes(1);

      expect(result).toBeDefined();
    });
  });
});
