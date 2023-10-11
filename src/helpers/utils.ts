import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { CreateUserDto } from 'modules/users/dto/create-user.dto';
import { UsersService } from 'modules/users/users.service';
import { ExtendedFarmWithUser, FarmsService } from 'modules/farms/farms.service';
import { AuthService } from 'modules/auth/auth.service';
import { AccessToken } from 'modules/auth/entities/access-token.entity';
import { CreateFarmDto } from 'modules/farms/dto/create-farm.dto';

export const disconnectAndClearDatabase = async (ds: DataSource): Promise<void> => {
  await clearDatabase(ds);
  await ds.destroy();
};

export const clearDatabase = async (ds: DataSource): Promise<void> => {
  const { entityMetadatas } = ds;

  await Promise.all(entityMetadatas.map(data => ds.query(`truncate table "${data.tableName}" cascade`)));
};

export const AMOUNT_OF_TEST_FARMS: number = 150;

export const dbSeed = async (usersService: UsersService, farmsService: FarmsService, authService: AuthService): Promise<any> => {
  const email = faker.internet.exampleEmail();
  const pwd = faker.string.alpha(10);

  const createdUser: CreateUserDto = {
    email,
    password: pwd,
    address: faker.location.streetAddress(),
    coordinates: `${faker.location.latitude()},${faker.location.longitude()}`,
  };

  const user = await usersService.createUser(createdUser);

  console.log(`Created test user with id ${user.id}`);

  const farms: ExtendedFarmWithUser[] = [];
  for (let i = 0; i < AMOUNT_OF_TEST_FARMS; i++) {
    const f: CreateFarmDto = {
      name: faker.word.words(3),
      coordinates: `${faker.location.latitude()},${faker.location.longitude()}`,
      address: faker.location.streetAddress(),
      size: parseFloat(faker.number.float({ min: 20, max: 100 }).toFixed(2)),
      yield: parseFloat(faker.number.float({ min: 20, max: 100 }).toFixed(2)),
    };

    const farm: ExtendedFarmWithUser = {
      ...f,
      user,
    };

    farms.push(farm);
  }

  try {
    await Promise.all(farms.map(f => farmsService.createFarm(f)));
  } catch (error) {
    throw error;
  }

  let token: AccessToken;
  try {
    token = await authService.login({ email, password: pwd });
  } catch (error) {
    throw error;
  }

  console.log(`Finished seeding test db`);

  return { userId: user.id, token: token.token };
};
