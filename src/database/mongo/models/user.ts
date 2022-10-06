import { model, Schema } from 'mongoose';

export interface IUser {
  id: string;
  name: string;
  lastName: string;
  fullName: string;
  email: string;
  salt: string;
  hash: string;
  role: Schema.Types.ObjectId;
}

const UserSchema = new Schema<IUser>(
  {
    id: {
      required: true,
      type: String,
      unique: true
    },
    name: {
      required: true,
      type: String
    },
    lastName: {
      required: true,
      type: String
    },
    email: {
      required: true,
      type: String
    },
    salt: {
      required: true,
      type: String
    },
    hash: {
      required: true,
      type: String
    },
    role: {
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
        delete ret._id;
      }
    }
  }
);

UserSchema.virtual('fullName').get(function (this: IUser): string {
  return `${this.name} ${this.lastName}`;
});

const UserModel = model('users', UserSchema);

export default UserModel;
