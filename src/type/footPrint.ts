import { Document } from "mongoose";

export interface IFootPrint extends Document {
    telegramId: number;
    points: number;
}
