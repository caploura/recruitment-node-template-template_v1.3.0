import config from 'config/config';
import { Express } from 'express';
import { faker } from '@faker-js/faker';
import http from 'http';
import { CreateUserDto } from 'modules/users/dto/create-user.dto';
import { UsersService } from 'modules/users/users.service';
import ds from 'orm/orm.config';
import * as supertest from 'supertest';
import { setupServer } from 'server/server';
import { clearDatabase, disconnectAndClearDatabase } from 'helpers/utils';
import { LoginUserDto } from '../dto/login-user.dto';
import { AccessToken } from '../entities/access-token.entity';

describe('AuthController', () => {
  let app: Express;
  let agent: supertest.SuperAgentTest;
  let server: http.Server;

  let usersService: UsersService;

  const randomEmail = faker.internet.exampleEmail();
  const randomPassword = faker.string.alpha(10);

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

  describe('POST /auth', () => {
    const createUser = async (userDto: CreateUserDto) => usersService.createUser(userDto);

    const loginDto: LoginUserDto = { email: randomEmail, password: randomPassword };
    const createUserDto: CreateUserDto = {
      email: randomEmail,
      password: randomPassword,
      address: faker.location.streetAddress(),
      coordinates: `${faker.location.latitude()},${faker.location.longitude()}`,
    };

    it('should login existing user', async () => {
      await createUser(createUserDto);

      const res = await agent.post('/api/auth/login').send(loginDto);
      const { token } = res.body as AccessToken;

      expect(res.statusCode).toBe(201);
      expect(token).toBeDefined();
    });

    it('should throw UnprocessableEntityError when user logs in with invalid email', async () => {
      const res = await agent.post('/api/auth/login').send({ email: 'invalidEmail', password: 'pwd' });

      expect(res.statusCode).toBe(422);
      expect(res.body).toMatchObject({
        name: 'UnprocessableEntityError',
        message: 'Invalid user email or password',
      });
    });

    it('should throw UnprocessableEntityError when user logs in with invalid password', async () => {
      await createUser(createUserDto);

      const res = await agent.post('/api/auth/login').send({ email: loginDto.email, password: 'invalidPassword' });

      expect(res.statusCode).toBe(422);
      expect(res.body).toMatchObject({
        name: 'UnprocessableEntityError',
        message: 'Invalid user email or password',
      });
    });
  });
});
