import { ErrorType } from "./constants";
import { Response } from "express";

export const Outline = (str: string) => {
  const pad = "=";
  const padLength = 50 - str.length;
  const padLeft = Math.ceil(padLength / 2);
  const padRight = padLength - padLeft;
  return pad.repeat(padLeft) + " " + str + " " + pad.repeat(padRight);
};

export const ErrorHandler = ({ res, status, message }: { res: Response; status: number; message: string }) => {
  return res.status(status || 500).json({
    status: status || 500,
    success: false,
    message: message.replace(/"/g, ""),
    data: null,
  });
};

export const SuccessHandler = ({ res, status, message, data = null }: { res: Response; status: number; message: string; data?: null | object }) => {
  return res.status(200).json({
    status: status,
    success: true,
    message: message,
    data,
  });
};
