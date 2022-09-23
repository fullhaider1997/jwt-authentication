import { MiddlewareFn } from "type-graphql/dist/interfaces/Middleware";
import { MyContext } from "./MyContext";
import { verify } from "jsonwebtoken";

//Middle function to check for the validity of token
export const isAuthMiddleWare: MiddlewareFn<MyContext> = (
  { context },
  next
) => {
  const authorization = context.req.headers.authorization;
  console.log(context.req.headers);

  // if authorization header is empty
  if (authorization == "") {
    throw new Error("not authenticated");
  }

  //if they do pass authorization header
  console.log("try");
  try {
    console.log("parsing authorization header");
    console.log({ authorization });
    const token = authorization.split(" ")[1];
    console.log({ token });

    const payload = verify(token, process.env.ACCESS_TOKEN_SECRET);

    context.payload = payload as any;
  } catch (err) {
    throw new Error("invalid token");
  }

  return next();
};
