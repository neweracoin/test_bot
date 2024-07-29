import { Document } from "mongoose";

export interface IHistory extends Document {
    telegramId: number;
    distance: number;
    points: number;
    steps: number;
    date: Date;

    getAllHistory: (userId: string) => Promise<IHistory[]>;
    updateHistory: (userId: string, distance: number, points: number, steps: number) => Promise<void>;
}
