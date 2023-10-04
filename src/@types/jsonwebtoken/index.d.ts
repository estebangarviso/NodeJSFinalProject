import jwt from 'jsonwebtoken'
import { IUser } from '../../database/mongo/models/user'
export default {}

declare module 'jsonwebtoken' {
  export interface UserJwtPayload extends JwtPayload {
    user: IUser & { password: string }
  }
}
