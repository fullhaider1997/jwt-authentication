import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import "reflect-metadata";
import "dotenv/config";
import * as express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./UserResolvers";
const cors = require("cors");
import { resolve } from "path";
import * as cookieParser from "cookie-parser";
import { JwtPayload, verify } from "jsonwebtoken";
import { MyContext } from "./MyContext";
import { createAccessToken, createRefreshToken } from "./auth";
import { sendRefreshToken } from "./sendRefreshToken";
(async () => {
  const app = express();
  app.use(
    cors({
      origin: ["http://localhost:4001/refresh_token", "http://localhost:3001"],
      credentials: "true",
    })
  );

  app.use(cookieParser());

  console.log(process.env.ACCESS_TOKEN_SECRET);
  console.log(process.env.REFRESH_TOKEN_SECRET);

  app.get("/", (req, res) => res.send("hello"));

  app.post("/refresh_token", async (req, res) => {
    console.log("...refresh_token");
    const token = req.cookies;
    console.log("headers");
    console.log(req.headers);

    //if refresh token is invalid
    if (!token) {
      return res.send({ ok: false, accessToken: "" });
    }
    console.log({ token });

    let payload: any = null;

    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      console.log(err);

      return res.send({ ok: false, accessToken: "" });
    }

    //token is valid, we can send back an access token now
    //let id: number = payload.userId;
    const user: any = await User.findOne({ where: { id: payload.userId } });

    if (!user) {
      return res.send({ ok: false, accessToken: "" });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.send({ ok: false, createAccessToken: "" });
    }

    sendRefreshToken(res, createRefreshToken(user));

    return res.send({ ok: true, accessToken: createAccessToken(user) });
  });

  AppDataSource.initialize()
    .then(async () => {
      // here you can start to work with your database
      console.log("init database");
    })
    .catch((error) => console.log(error));

  const apolloServer = new ApolloServer({
    //async functions
    schema: await buildSchema({
      resolvers: [UserResolver],
    }),
    csrfPrevention: true,

    context: ({ req, res }) => ({ req, res }),
  });

  await apolloServer.start();
  app.use(cookieParser());

  apolloServer.applyMiddleware({ app, path: "/graphql" });

  //rest api server
  app.listen(4001, () => {
    console.log("express server started");
  });
})();
