import { resolveSoa } from "dns";
import {
  Arg,
  Ctx,
  Mutation,
  ObjectType,
  Query,
  Int,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { compare, hash } from "bcryptjs";
import { User } from "./entity/User";
import { LoginResponse } from "./entity/LoginResponse";
import { sign } from "jsonwebtoken";
import { MyContext } from "./MyContext";
import { createAccessToken, createRefreshToken } from "./auth";
import { isAuthMiddleWare } from "./isAuthMiddleWare";
import { sendRefreshToken } from "./sendRefreshToken";
import { getConnection } from "typeorm";

//Resolvers are like control class that contain all the functions for fetching, modifying and adding data
@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return "Hi from typegraph";
  }
  @Query(() => String)
  haider() {
    return "haider";
  }

  //middleware reusable class
  @Query(() => String)
  @UseMiddleware(isAuthMiddleWare)
  bye(@Ctx() { payload }: MyContext) {
    console.log(payload);
    return `your user id is ;${payload.userId}`;
  }

  @Query(() => [User])
  users() {
    return User.find();
  }

  @Mutation(() => Boolean)
  async revokeRefreshTokenForUser(@Arg("userId", () => Int) userId: number) {
    await getConnection()
      .getRepository(User)
      .increment({ id: userId }, "tokenVersion", 1);

    return true;
  }

  @Mutation(() => Boolean)
  async register(
    @Arg("email", () => String) email: string,
    @Arg("password") password: string
  ) {
    const hashedPassword = await hash(password, 12);

    try {
      await User.insert({
        email,
        password: hashedPassword,
      });
    } catch (error) {
      console.log(error);
      return false;
    }
    return true;
  }

  //Return refresh token

  @Mutation(() => LoginResponse)
  async login(
    @Arg("email", () => String) email: string,
    @Arg("password") password: string,
    @Ctx() { res, req }: MyContext
  ): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email } });

    //if user doesn't exist
    if (!user) {
      throw new Error("couldn't find user");
    }

    const valid = await compare(password, user.password);

    if (!valid) {
      throw new Error("Wrong password");
    }

    //login sucessful
    //refresh token: used to help the client to refresh access token
    sendRefreshToken(res, createRefreshToken(user));

    //if program reach this line, it means the user logined successfully
    //access token is token used to access a resource in the web application
    return {
      accessToken: createAccessToken(user),
    };
  }
}
