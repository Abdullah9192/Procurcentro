import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { db, NODE_ENV } from "./EnvVariables";

dotenv.config();

const isProduction = NODE_ENV === "production";

export const databaseConfig = {
  username: db.USERNAME!,
  password: db.PASSWORD!,
  database: db.DATABASE!,
  host: db.HOST!,
  port: db.PORT,
  dialect: "postgres",
  dialectOptions: isProduction
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false, // true if you're using a trusted CA
        },
      }
    : {},
  logging: false,
  pool: {
    max: 100,
    min: 5,
    acquire: 60000,
    idle: 10000,
    evict: 10000,
  },
};

const AppDataSource = new Sequelize(
  db.DATABASE!,
  db.USERNAME!,
  db.PASSWORD!,
  {
    host: db.HOST!,
    port: db.PORT,
    dialect: "postgres",
    dialectOptions: isProduction
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
    logging: false,
    pool: {
      max: 100,
      min: 5,
      acquire: 60000,
      idle: 10000,
      evict: 10000,
    },
  }
);

export default AppDataSource;
