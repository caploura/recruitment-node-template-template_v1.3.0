import config from 'config/config';
import { UnauthorizedError } from 'errors/errors';
import { NextFunction, Request, Response } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';
import { AuthService } from 'modules/auth/auth.service';

export type ExtendedRequest = Request & {
  user: any;
};

export const authMiddleware = async (req: ExtendedRequest, _: Response, next: NextFunction): Promise<void> => {
  const authService = new AuthService();

  if (!req.headers.authorization) {
    return next(new UnauthorizedError());
  }

  const token = req.headers.authorization!.split(' ')[1];
  let verifiedToken;

  try {
    verifiedToken = await verifyAsync(token);
  } catch (error) {
    next(error);
  }

  if (!verifiedToken) {
    return next(new UnauthorizedError());
  }

  let existingToken;
  try {
    existingToken = await authService.getAccessToken(token);
    req.user = existingToken.user;
  } catch (error) {
    return next(error);
  }

  next();
};

const verifyAsync = async (token: string): Promise<JwtPayload> =>
  new Promise((res, rej) => {
    verify(token, config.JWT_SECRET, (err, data) => {
      if (err) return rej(new UnauthorizedError());
      return res(data as JwtPayload);
    });
  });
