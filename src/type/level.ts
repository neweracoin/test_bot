import { Document } from "mongoose";

export interface ILevel extends Document {
    level: number;
    levelName: string;
    requires: number;
    pointsPerStep: number;
}
