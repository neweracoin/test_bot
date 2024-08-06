import { Schema, model } from "mongoose";
import { IFootPrint } from "../type/footPrint";

const FootPrintModel = new Schema<IFootPrint>(
    {
        telegramId: {
            type: Number,
            required: true
        },
        points: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export default model<IFootPrint>("FootPrint", FootPrintModel);
