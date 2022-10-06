export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test' | 'local';
      MONGO_URI: string;
      PORT: string;
      SECRET: string;
    }
  }
}
