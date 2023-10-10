import * as dotenv from 'dotenv';
dotenv.config();

export const settingsEnv = {
  PORT: process.env.PORT,
  MONGO_URL: process.env.MONGO_URL,
  DB_NAME: process.env.DB_NAME,
  LOCAL_URL: process.env.LOCAL_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_TOKEN_LIFE: process.env.JWT_TOKEN_LIFE,
  JWT_REFRESH_TOKEN_LIFE: process.env.JWT_REFRESH_TOKEN_LIFE,
  JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET
}