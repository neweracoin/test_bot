import { Schema, model } from "mongoose";
import { IUser } from "../type/user";

const UserModel = new Schema<IUser>(
    {
        telegramId: {
            type: Number,
            required: true,
            unique: true
        },
        username: {
            type: String,
            required: true
        },
        firstName: {
            type: String
        },
        lastName: {
            type: String
        },
        gender: {
            type: String
        },
        points: {
            type: Number,
            default: 0
        },
        totalPoints: {
            type: Number,
            default: 0
        },
        bonus: {
            type: Number,
            default: 0
        },
        level: {
            type: Number,
            default: 0
        },
        referralCode: {
            type: String,
            unique: true
        },
        referredBy: {
            type: String,
           
        },
        referrals: [
            {
                telegramId: {
                    type: Number,
                    required: true
                },
                fullname: {
                    type: String,
                    required: true
                }
            }
        ],
        tasksClaimed: [
            {
                taskId: {
                    type: Number,
                    required: true
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

UserModel.methods.getRefereePoints = async function () {
    const referrals = this.referrals;
    if (!referrals.length) {
        return [];
    }
    const users = (await this.model("Users").find({ telegramId: { $in: referrals.map((ref: any) => ref.telegramId) } }).limit(100)) as IUser[];
    return users.map((user) => ({ fullname: user.firstName + " " + user.lastName, username: user.username, points: user.points * 0.1 }));
};

UserModel.methods.addReferee = async function (telegramId: number, fullname: string) {
    this.referrals.push({ telegramId, fullname });
    // this.points += 750;
    await this.save();
};
UserModel.methods.addReferredBy = async function (referralCode: string) {
   
    this.referredBy = referralCode;
    await this.save();
};

UserModel.pre<IUser>("save", function (next) {
    if (!this.referralCode){
    this.referralCode = Math.random().toString(36).substring(2, 7);
    }
    next();
});

UserModel.methods.addPoints = async function (points: number) {
    this.points += points;
    this.totalPoints += points;
    await this.save();
};
UserModel.methods.setBonusPoints = async function (bonus: number) {
    this.bonus = bonus;
    this.totalPoints = this.points + bonus;
    await this.save();
};

UserModel.methods.deductPoints = async function (points: number) {
    this.points -= points;
    await this.save();
};

UserModel.methods.getTasks = async function () {
    return this.tasksClaimed;
};

UserModel.methods.claimTask = async function (taskId: number, points: number) {
    if (this.tasksClaimed.length && this.tasksClaimed.find((task: any) => task.taskId === taskId)) {
        return;
    }
    this.tasksClaimed.push({ taskId });
    this.points += points;
    this.totalPoints += points;

    await this.save();
};

UserModel.methods.setGender = async function (gender: string) {
    this.gender = gender;
    await this.save();
};

export default model<IUser>("Users", UserModel);
