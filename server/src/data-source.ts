import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "6F@pc1*R",
  database: "haider",
  synchronize: true,
  logging: true,
  entities: [User],
});
