import { SECRET } from '~/config';

import jwt, { UserJwtPayload } from 'jsonwebtoken';
import httpErrors from 'http-errors';

import UserService from '~/services/user';
import { RequestHandler, NextFunction } from 'express';
import { IUser } from '~/database/mongo/models/user';

const NOT_ALLOWED_TO_BE_HERE = 'You are not allowed here!';

const getToken: (authorization: string) => string = (authorization) => {
  if (!authorization) throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE);

  const [tokenType, token] = authorization.split(' ');

  if (tokenType !== 'Bearer') throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE);

  return token;
};

const validateUserPayload: (payload: UserJwtPayload) => {
  email: IUser['email'];
  password: string;
} = (payload) => {
  const { email, password, iat, exp, ...rest } = payload;

  if (!email) throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE);

  if (!password) throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE);

  if (Object.keys(rest).length !== 0) throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE);

  return { email, password };
};

const handleError: (error: Object, next: NextFunction) => void = (error, next) => {
  console.error('error', error);

  if (error instanceof jwt.TokenExpiredError) return next(new httpErrors.Unauthorized('Session expired!'));

  if (error instanceof httpErrors.Unauthorized) return next(error);

  return next(new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE));
};

const generateTokens = (): RequestHandler => {
  return (req, res, next) => {
    const {
      body: { email, password }
    } = req;

    const payload = { email, password };
    const accessToken = jwt.sign(payload, SECRET, {
      expiresIn: '10min'
    });
    const refreshToken = jwt.sign(payload, SECRET, {
      expiresIn: '1h'
    });

    req.accessToken = accessToken;
    req.refreshToken = refreshToken;
    next();
  };
};

const verifyUser = (): RequestHandler => {
  return async (req, res, next) => {
    try {
      const {
        headers: { authorization }
      } = req;
      if (!authorization) throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE);
      const token = getToken(authorization);
      const payload = jwt.verify(token, SECRET);
      const { email, password } = validateUserPayload(payload as UserJwtPayload);
      const isLoginCorrect = Boolean(await new UserService({ email, password }).login());

      if (isLoginCorrect) return next();

      return next(new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE));
    } catch (error: any) {
      return handleError(error, next);
    }
  };
};

const verifyIsCurrentUser = (): RequestHandler => {
  return async (req, res, next) => {
    try {
      const {
        params: { id: userId },
        headers: { authorization }
      } = req;
      if (!authorization) throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE);
      const token = getToken(authorization);
      const payload = jwt.verify(token, SECRET) as UserJwtPayload;
      const { email, password } = validateUserPayload(payload);
      const user = await new UserService({ email, password }).login();
      const isLoginCorrect = Boolean(user);

      if (isLoginCorrect && user.id === userId) return next();

      return next(new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE));
    } catch (error: any) {
      return handleError(error, next);
    }
  };
};

const refreshAccessToken = (): RequestHandler => {
  return async (req, res, next) => {
    try {
      const {
        params: { id: userId },
        headers: { authorization }
      } = req;
      if (!authorization) throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE);
      const token = getToken(authorization);
      const payload = jwt.verify(token, SECRET) as UserJwtPayload;
      const { email, password } = validateUserPayload(payload);
      const user = await new UserService({ email, password }).login();
      const isLoginCorrect = Boolean(user);

      if (!(isLoginCorrect && user.id === userId)) throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE);

      const accessToken = jwt.sign({ email, password }, SECRET, {
        expiresIn: '10min'
      });

      req.accessToken = accessToken;
      req.refreshToken = token;
      next();
    } catch (error: any) {
      return handleError(error, next);
    }
  };
};

export default {
  generateTokens,
  verifyUser,
  verifyIsCurrentUser,
  refreshAccessToken
};
