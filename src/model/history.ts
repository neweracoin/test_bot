import { Schema, model } from "mongoose";
import { IHistory } from "../type/history";

const HistoryModel = new Schema<IHistory>(
    {
        telegramId: {
            type: Number,
            required: true,
        },
        distance: {
            type: Number,
            required: true,
        },
        points: {
            type: Number,
            required: true,
        },
        steps: {
            type: Number,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

HistoryModel.methods.getHistory = async function (this: IHistory, telegramId: string) {
    const history = await this.model("History").find({ telegramId }).sort({ date: -1 });
    return history;
};

HistoryModel.methods.updateHistory = async function (this: IHistory, telegramId: string, distance: number, points: number, steps: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const history = (await this.model("History").findOne({ telegramId, date: today })) as IHistory;
    if (history) {
        history.distance += distance;
        history.points += points;
        history.steps += steps;
        await history.save();
    } else {
        await this.model("History").create({ telegramId, distance, points, steps, date: today });
    }
};

export default model<IHistory>("History", HistoryModel);
