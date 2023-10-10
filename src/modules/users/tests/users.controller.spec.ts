import config from 'config/config';
import { faker } from '@faker-js/faker';
import { Express } from 'express';
import { setupServer } from 'server/server';
import { clearDatabase, disconnectAndClearDatabase } from 'helpers/utils';
import http, { Server } from 'http';
import ds from 'orm/orm.config';
import supertest, { SuperAgentTest } from 'supertest';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersService } from '../users.service';

describe('UsersController', () => {
  let app: Express;
  let agent: SuperAgentTest;
  let server: Server;

  let usersService: UsersService;

  beforeAll(async () => {
    app = setupServer();
    await ds.initialize();

    server = http.createServer(app).listen(config.APP_PORT);
  });

  afterAll(async () => {
    await disconnectAndClearDatabase(ds);
    server.close();
  });

  beforeEach(async () => {
    await clearDatabase(ds);

    agent = supertest.agent(app);
    usersService = new UsersService();
  });

  describe('POST /users', () => {
    const createUserDto: CreateUserDto = {
      email: faker.internet.exampleEmail(),
      password: faker.string.alpha(10),
      address: faker.location.streetAddress(),
      coordinates: `${faker.location.latitude()},${faker.location.longitude()}`,
    };

    it('should create new user', async () => {
      const res = await agent.post('/api/users').send(createUserDto);

      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        id: expect.any(String),
        email: expect.stringContaining(createUserDto.email) as string,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should throw UnprocessableEntityError if user already exists', async () => {
      await usersService.createUser(createUserDto);

      const res = await agent.post('/api/users').send(createUserDto);

      expect(res.statusCode).toBe(422);
      expect(res.body).toMatchObject({
        name: 'UnprocessableEntityError',
        message: 'A user for the email already exists',
      });
    });

    describe('POST /transaction - payload validation', () => {
      const testCases = [
        {
          title: 'should return BadRequestError when email is not sent',
          requestPayload: {
            payload: {
              ...createUserDto,
              email: undefined,
            },
          },
          responsePayload: {
            status: 400,
            message: 'email should not be empty,email must be an email',
          },
        },
        {
          title: 'should return BadRequestError when password is not sent',
          requestPayload: {
            payload: {
              ...createUserDto,
              password: undefined,
            },
          },
          responsePayload: {
            status: 400,
            message: 'password should not be empty,password must be a string',
          },
        },
        {
          title: 'should return BadRequestError when coordinates is not sent',
          requestPayload: {
            payload: {
              ...createUserDto,
              coordinates: undefined,
            },
          },
          responsePayload: {
            status: 400,
            message: 'coordinates should not be empty,coordinates must be a latitude,longitude string',
          },
        },
        {
          title: 'should return BadRequestError when address is not sent',
          requestPayload: {
            payload: {
              ...createUserDto,
              address: undefined,
            },
          },
          responsePayload: {
            status: 400,
            message: 'address should not be empty,address must be a string',
          },
        },
      ];

      test.each(testCases)('$title', async ({ requestPayload, responsePayload }) => {
        const { statusCode, body } = await agent.post('/api/users').send(requestPayload.payload);

        expect(statusCode).toBe(responsePayload.status);
        expect(body.message).toBe(responsePayload.message);
      });
    });
  });
});
