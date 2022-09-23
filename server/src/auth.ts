import { User } from "./entity/User";
import { sign } from "jsonwebtoken";

//Allow us to access a resource in the system
export const createAccessToken = (user: User) => {
  return sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

//create refresh token
export const createRefreshToken = (user: User) => {
  let token: any = sign(
    { userId: user.id, tokenVersion: user.tokenVersion },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7days",
    }
  );
  console.log(token);

  return token;
};
