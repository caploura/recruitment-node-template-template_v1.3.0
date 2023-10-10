import config from 'config/config';
import { Express } from 'express';
import { setupServer } from 'server/server';
import { dbSeed, disconnectAndClearDatabase } from 'helpers/utils';
import http, { Server } from 'http';
import ds from 'orm/orm.config';
import { UsersService } from 'modules/users/users.service';
import { FarmsService } from '../farms.service';
import supertest, { SuperAgentTest } from 'supertest';
import { CreateFarmDto } from '../dto/create-farm.dto';
import { faker } from '@faker-js/faker';
import { AuthService } from 'modules/auth/auth.service';

describe('FarmsController', () => {
  let app: Express;
  let agent: SuperAgentTest;
  let server: Server;

  let testUserToken: string;

  beforeAll(async () => {
    app = setupServer();
    await ds.initialize();

    server = http.createServer(app).listen(config.APP_PORT);

    testUserToken = await dbSeed(new UsersService(), new FarmsService(), new AuthService());
  });

  afterAll(async () => {
    await disconnectAndClearDatabase(ds);
    server.close();
  });

  beforeEach(async () => {
    agent = supertest.agent(app);
  });

  describe('POST /farms', () => {
    const newFarm: CreateFarmDto = {
      name: faker.word.words(3),
      coordinates: `${faker.location.latitude()},${faker.location.longitude()}`,
      address: faker.location.streetAddress(),
      size: parseFloat(faker.number.float({ min: 20, max: 100 }).toFixed(2)),
      yield: parseFloat(faker.number.float({ min: 20, max: 100 }).toFixed(2)),
    };

    it('should successfuly create a farm', async () => {
      const { statusCode, body } = await agent
        .post('/api/farms')
        .set({ authorization: `Bearer ${testUserToken}` })
        .send(newFarm);

        console.log(body);
        

      expect(statusCode).toBe(201);
      expect(body).toMatchObject({
        id: expect.any(String),
        // email: expect.stringContaining(createUserDto.email) as string,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });
});
