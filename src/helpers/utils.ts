import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { CreateFarmDto } from 'modules/farms/dto/create-farm.dto';
import { CreateUserDto } from 'modules/users/dto/create-user.dto';
import { UsersService } from 'modules/users/users.service';
import { ExtendedFarm, FarmsService } from 'modules/farms/farms.service';
import { AuthService } from 'modules/auth/auth.service';
import { AccessToken } from 'modules/auth/entities/access-token.entity';

export const disconnectAndClearDatabase = async (ds: DataSource): Promise<void> => {
  await clearDatabase(ds);
  await ds.destroy();
};

export const clearDatabase = async (ds: DataSource): Promise<void> => {
  const { entityMetadatas } = ds;

  await Promise.all(entityMetadatas.map(data => ds.query(`truncate table "${data.tableName}" cascade`)));
};

export const dbSeed = async (usersService: UsersService, farmsService: FarmsService, authService: AuthService): Promise<string> => {
  const email = faker.internet.exampleEmail();
  const pwd = faker.string.alpha(10);

  const user: CreateUserDto = {
    email,
    password: pwd,
    address: faker.location.streetAddress(),
    coordinates: `${faker.location.latitude()},${faker.location.longitude()}`,
  };

  const { id: userId } = await usersService.createUser(user);

  console.log(`Created test user with id ${userId}`);

  const farms: CreateFarmDto[] = [];
  for (let i = 0; i < 150; i++) {
    const f: ExtendedFarm = {
      name: faker.word.words(3),
      coordinates: `${faker.location.latitude()},${faker.location.longitude()}`,
      address: faker.location.streetAddress(),
      userId,
      size: parseFloat(faker.number.float({ min: 20, max: 100 }).toFixed(2)),
      yield: parseFloat(faker.number.float({ min: 20, max: 100 }).toFixed(2)),
    };

    farms.push(f);
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

  return token.token;
};
