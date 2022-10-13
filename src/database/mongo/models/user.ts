import { model, Schema, Document, Types } from 'mongoose'
import { ROLES_IDS } from './../../../utils/role'

export interface IUser {
  id: string
  firstName: string
  lastName: string
  email: string
  salt: string
  hash: string
  roleId: Types.ObjectId
}

export interface TSubmitUser {
  firstName: IUser['firstName']
  lastName: IUser['lastName']
  email: IUser['email']
  password: string
  roleId: ROLES_IDS
}

const UserSchema = new Schema<IUser>(
  {
    id: {
      required: true,
      type: String,
      unique: true
    },
    firstName: {
      required: true,
      type: String
    },
    lastName: {
      required: true,
      type: String
    },
    email: {
      required: true,
      type: String,
      unique: true
    },
    salt: {
      required: true,
      type: String
    },
    hash: {
      required: true,
      type: String
    },
    roleId: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: 'roles'
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toObject: {
      transform: (_, ret) => {
        delete ret._id
        delete ret.salt
        delete ret.hash
      }
    }
  }
)

UserSchema.virtual('fullName').get(function (this: IUser): string {
  return `${this.firstName} ${this.lastName}`
})

const UserModel = model('users', UserSchema)
export default UserModel