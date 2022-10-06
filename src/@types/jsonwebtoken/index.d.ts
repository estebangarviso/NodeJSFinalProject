export default {};
import jwt from 'jsonwebtoken';
import { IUser } from '~/database/mongo/models/user';

declare module 'jsonwebtoken' {
  export interface UserJwtPayload extends JwtPayload {
    user: IUser & { password: string };
  }
}
