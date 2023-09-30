import { model, Schema } from 'mongoose'
import { ROLE_NAMES } from '../../../utils/role'

export interface IRole {
  id: string
  name: string
}

const RoleSchema = new Schema(
  {
    id: {
      required: true,
      type: String,
      unique: true
    },
    name: {
      required: true,
      type: String,
      enum: ROLE_NAMES
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toObject: {
      transform: (_, ret) => {
        delete ret._id
      }
    }
  }
)

const RoleModel = model('roles', RoleSchema)
export default RoleModel
