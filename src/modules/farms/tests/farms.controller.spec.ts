import config from 'config/config';
import { Express } from 'express';
import { setupServer } from 'server/server';
import { AMOUNT_OF_TEST_FARMS, clearDatabase, dbSeed, disconnectAndClearDatabase } from 'helpers/utils';
import http, { Server } from 'http';
import ds from 'orm/orm.config';
import { UsersService } from 'modules/users/users.service';
import { FarmsService } from '../farms.service';
import supertest, { SuperAgentTest } from 'supertest';
import { CreateFarmDto } from '../dto/create-farm.dto';
import { faker } from '@faker-js/faker';
import { AuthService } from 'modules/auth/auth.service';
import { DistanceService } from 'modules/distance/distance.service';

describe('FarmsController', () => {
  let app: Express;
  let agent: SuperAgentTest;
  let server: Server;

  let testUserId: string;
  let testUserToken: string;
  let authHeader: string;

  let mockDistanceFunc;

  beforeAll(async () => {
    app = setupServer();
    await ds.initialize();

    server = http.createServer(app).listen(config.APP_PORT);

    ({ userId: testUserId, token: testUserToken } = await dbSeed(new UsersService(), new FarmsService(), new AuthService()));
    authHeader = `Bearer ${testUserToken}`;
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
      const { statusCode, body } = await agent.post('/api/farms').set({ authorization: authHeader }).send(newFarm);

      expect(statusCode).toBe(201);
      expect(body).toStrictEqual({
        id: expect.any(String),
        name: newFarm.name,
        address: newFarm.address,
        coordinates: newFarm.coordinates,
        userId: testUserId,
        size: newFarm.size,
        farmYield: newFarm.yield,
      });
    });

    it('should throw unauthorized error when auth header is not sent', async () => {
      const { statusCode } = await agent.post('/api/farms').send(newFarm);

      expect(statusCode).toBe(401);
    });

    it('should throw unauthorized error when auth header is malformed', async () => {
      const { statusCode } = await agent.post('/api/farms').set({ authorization: testUserToken }).send(newFarm);

      expect(statusCode).toBe(401);
    });

    it('should throw unauthorized error when token doesnt exist', async () => {
      const { statusCode } = await agent.post('/api/farms').set({ authorization: 'Bearer non-existing-token' }).send(newFarm);

      expect(statusCode).toBe(401);
    });
  });

  describe('GET /farms', () => {
    const mockDistanceValues: any[] = [];

    for (let i = 0; i < AMOUNT_OF_TEST_FARMS; i++) {
      mockDistanceValues.push({
        distance: {
          text: faker.word.noun(),
          value: i,
        },
        duration: {
          text: faker.word.noun(),
          value: i,
        },
        status: 'OK',
      });
    }

    beforeAll(async () => {
      await clearDatabase(ds);

      ({ userId: testUserId, token: testUserToken } = await dbSeed(new UsersService(), new FarmsService(), new AuthService()));
      authHeader = `Bearer ${testUserToken}`;
    });

    beforeEach(() => {
      jest.resetAllMocks();
      mockDistanceFunc = jest.spyOn(DistanceService.prototype, 'getDistanceBetweenTwoPointsFromGoogleApi');
      mockDistanceFunc.mockResolvedValue({
        destination_addresses: [faker.location.streetAddress()],
        origin_addresses: [faker.location.streetAddress()],
        rows: [
          {
            elements: mockDistanceValues,
          },
        ],
      });
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should successfuly retrieve farms from DB in DESC order - Returns max page size 100', async () => {
      const url = `/api/farms`;
      const { statusCode, body } = await agent.get(url).set({ authorization: authHeader });

      expect(statusCode).toBe(200);
      expect(body.length).toBe(100);

      expect(body[0].name > body[1].name).toBe(true);
    });

    it('should return unauthorized error when auth header is not sent', async () => {
      const url = `/api/farms`;
      const { statusCode } = await agent.get(url);

      expect(statusCode).toBe(401);
    });

    it('should return unauthorized error when auth header is not sent', async () => {
      const url = `/api/farms`;
      const { statusCode } = await agent.get(url).set({ authorization: 'Bearer non-existing-token' });

      expect(statusCode).toBe(401);
    });

    it('should successfuly retrieve farms from DB in ASC order - Returns max page size 100', async () => {
      const url = `/api/farms?sortOrder=ASC`;
      const { statusCode, body } = await agent.get(url).set({ authorization: authHeader });

      expect(statusCode).toBe(200);
      expect(body.length).toBe(100);

      expect(body[0].name < body[1].name).toBe(true);
    });

    it('should successfuly retrieve farms from DB in ASC order - Limit = 50', async () => {
      const url = `/api/farms?sortOrder=ASC&limit=50`;
      const { statusCode, body } = await agent.get(url).set({ authorization: authHeader });

      expect(statusCode).toBe(200);
      expect(body.length).toBe(50);

      expect(body[0].name < body[1].name).toBe(true);
    });

    it('should successfuly retrieve farms from DB in ASC order - Offset = 100 (returns 50 records)', async () => {
      const url = `/api/farms?sortOrder=ASC&offset=100`;
      const { statusCode, body } = await agent.get(url).set({ authorization: authHeader });

      expect(statusCode).toBe(200);
      expect(body.length).toBe(50);

      expect(body[0].name < body[1].name).toBe(true);
    });

    it('should successfuly retrieve farms from DB ordered by distance ascending', async () => {
      const url = `/api/farms?sortOrder=ASC&sortColumn=distance`;
      const { statusCode, body } = await agent.get(url).set({ authorization: authHeader });

      expect(statusCode).toBe(200);
      expect(body.length).toBe(100);

      expect(body[0].distance < body[1].distance).toBe(true);
    });

    it('should successfuly retrieve farms from DB ordered by distance descending', async () => {
      const url = `/api/farms?sortOrder=DESC&sortColumn=distance`;
      const { statusCode, body } = await agent.get(url).set({ authorization: authHeader });

      expect(statusCode).toBe(200);
      expect(body.length).toBe(100);

      expect(body[0].distance > body[1].distance).toBe(true);
    });

    it('should successfuly retrieve farms from DB ordered by distance descending - Only include outliers', async () => {
      const url = `/api/farms?sortOrder=DESC&sortColumn=distance&outliers=true`;
      const { statusCode, body } = await agent.get(url).set({ authorization: authHeader });

      expect(statusCode).toBe(200);
      expect(body.length).toBeLessThan(100); // Taking into account the mock data generated, this should always be true;

      expect(body[0].distance > body[1].distance).toBe(true);
    });
  });
});
