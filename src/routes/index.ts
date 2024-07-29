import { ErrorHandler, SuccessHandler } from "../utils/helpers";
import { Application, Response } from "express";
import { ErrorType } from "../utils/constants";
import UserRouter from "./user";

export default (app: Application) => {
  const apiPrefix = `/api/v1`;

  app.get(`${apiPrefix}/healthz`, (req, res) => {
    SuccessHandler({
      res,
      status: 200,
      message: `Trekbot in good health`,
      data: null,
    });
  });

  app.use(`${apiPrefix}/user`, UserRouter);

  app.use((err: ErrorType, req: any, res: Response, next: any) => {
    if (err) {
      return ErrorHandler({
        res,
        status: 500,
        message: err.message,
      });
    } else {
      next();
    }
  });
};
