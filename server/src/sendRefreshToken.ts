import { Response } from "express";

export const sendRefreshToken = (res: Response, token: any) => {
  res.cookie("jid", token, {
    httpOnly: true,
  });
};
