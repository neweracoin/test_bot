import { Document } from "mongoose";

export interface IUser extends Document {
    telegramId: number;
    username: string;
    firstName: string;
    lastName: string;
    gender: string;
    points: number;
    level: number;
    referralCode: string;
    referrals: {
        telegramId: number;
        fullname: string;
    }[];
    tasksClaimed: {
        taskId: number;
    }[];

    getRefereePoints: () => Promise<{ username: string; points: number }[]>;
    addPoints: (points: number) => Promise<void>;
    deductPoints: (points: number) => Promise<void>;
    addReferee: (referralId: number, fullname: string) => Promise<void>;
    getTasks: () => Promise<{ taskId: number; name: string }[]>;
    claimTask: (taskId: number, points: number) => Promise<void>;
    setGender: (gender: string) => Promise<void>;
}
