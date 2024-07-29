import { Schema, model } from "mongoose";
import { ILevel } from "../type/level";

const LevelModel = new Schema<ILevel>(
    {
        level: {
            type: Number,
            required: true,
            unique: true,
        },
        requires: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

export default model<ILevel>("Levels", LevelModel);
