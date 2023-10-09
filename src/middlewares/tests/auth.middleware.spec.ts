import config from 'config/config';
import { faker } from '@faker-js/faker';
import { fromUnixTime } from 'date-fns';
import { UnauthorizedError } from 'errors/errors';
import { Express, Response } from 'express';
import { clearDatabase, disconnectAndClearDatabase } from 'helpers/utils';
import http from 'http';
import { decode, sign } from 'jsonwebtoken';
import { ExtendedRequest, authMiddleware } from 'middlewares/auth.middleware';
import { AccessToken } from 'modules/auth/entities/access-token.entity';
import { CreateUserDto } from 'modules/users/dto/create-user.dto';
import { User } from 'modules/users/entities/user.entity';
import { UsersService } from 'modules/users/users.service';
import ds from 'orm/orm.config';
import { setupServer } from 'server/server';
import { Repository } from 'typeorm';

const mockedNext = jest.fn();

describe('AuthMiddleware', () => {
  let server: http.Server;
  let app: Express;

  let usersService: UsersService;
  let accessTokenRepository: Repository<AccessToken>;

  const createUserDto: CreateUserDto = {
    email: faker.internet.exampleEmail(),
    password: faker.string.alpha(10),
    address: faker.location.streetAddress(),
    coordinates: `${faker.location.latitude()},${faker.location.longitude()}`,
  };

  const signAsync = async (user: User) => {
    const token = sign(
      {
        id: user.id,
        email: user.email,
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_AT },
    );

    return accessTokenRepository.save({
      user,
      token,
      expiresAt: getTokenExpireDate(token),
    });
  };

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

    usersService = new UsersService();
    accessTokenRepository = ds.getRepository(AccessToken);
  });

  it('should validate existing token with given token', async () => {
    const user = await usersService.createUser(createUserDto);
    const { token } = await signAsync(user);

    const req = { headers: { authorization: `Bearer ${token}` } } as ExtendedRequest;

    await authMiddleware(req, {} as Response, mockedNext);

    expect(req.user).toBeDefined();
    expect(req.user).toBeInstanceOf(User);
  });

  it('should throw Unauthorized error when auth token is not provided', async () => {
    const req = { headers: {} } as ExtendedRequest;

    await authMiddleware(req, {} as Response, mockedNext).catch((err: UnauthorizedError) => {
      expect(err).toBeInstanceOf(UnauthorizedError);
      expect(err.message).toEqual('Unauthorized');
    });
  });

  it('should throw Unauthorized error when token is not valid', async () => {
    const req = { headers: { authorization: 'Bearer not_valid' } } as ExtendedRequest;

    await authMiddleware(req, {} as Response, mockedNext).catch((err: UnauthorizedError) => {
      expect(err).toBeInstanceOf(UnauthorizedError);
      expect(err.message).toEqual('Unauthorized');
    });
  });
});

const getTokenExpireDate = (token: string) => {
  const { exp } = decode(token) as { [exp: string]: number };

  return fromUnixTime(exp);
};
