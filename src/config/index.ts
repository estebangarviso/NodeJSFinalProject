import 'dotenv/config';

export const NODE_ENV = process.env.NODE_ENV;
export const MONGO_URI = process.env.MONGO_URI;
export const PORT = process.env.PORT || 3000;
export const SECRET = process.env.SECRET;

const Config = {
  verify: new Promise((resolve, reject) => {
    if (!MONGO_URI) {
      reject('MONGO_URI is not defined.');
    }
    if (!PORT) {
      reject('PORT is not defined.');
    }
    resolve('Environment variables are set correctly');
  })
};

export default Config;
