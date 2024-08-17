import { Router } from "express";
import User from "../model/user";
import Level from "../model/level";
import { ErrorHandler, SuccessHandler } from "../utils/helpers";
import { IUser } from "../type/user";
import { ILevel } from "../type/level";
import FootPrint from "../model/footPrint";

const router = Router();

router.get("/exist", async (req, res) => {
    const { tid } = req.query;
    if (!tid) {
        return ErrorHandler({
            res,
            status: 400,
            message: "Please provide a telegram id"
        });
    }
    const user = await User.findOne({ telegramId: tid });
    if (!user) {
        return ErrorHandler({
            res,
            status: 404,
            message: "User not found"
        });
    }

    let referees = await user.getRefereePoints();
    const { referrals, ...userData } = user.toObject();
    const data = {
        ...userData,
        referees
    };
    SuccessHandler({
        res,
        status: 200,
        message: "User found",
        data: data
    });
});

router.post("/save", async (req, res) => {
    const { telegramId, username, gender, fullname } = req.body;
    if (!telegramId || !username || !fullname) {
        return ErrorHandler({
            res,
            status: 400,
            message: "Please provide all required fields"
        });
    }

    const name = fullname.split(" ");
    const firstName = name[0].toLowerCase();
    const lastName = name[1]?.toLowerCase() || "";
    const user = await User.create({
        telegramId,
        username,
        gender,
        firstName,
        lastName
    });

    SuccessHandler({
        res,
        status: 201,
        message: "Account Created",
        data: user
    });
});

router.put("/gender", async (req, res) => {
    const { telegramId, gender } = req.body;

    const user = (await User.findOne({ telegramId })) as IUser;
    if (!user) {
        return ErrorHandler({
            res,
            status: 404,
            message: "your account is invalid"
        });
    }

    await user.setGender(gender);

    SuccessHandler({
        res,
        status: 200,
        message: "Gender updated"
    });
});

router.post("/footprint", async (req, res) => {
    const { telegramId, point }: { telegramId: number; point: number } = req.body;
    const user = (await User.findOne({ telegramId })) as IUser;
    if (!user) {
        return ErrorHandler({
            res,
            status: 404,
            message: "your account is invalid"
        });
    }

    let isLoggedForToday = await FootPrint.findOne({ telegramId, createdAt: { $gte: new Date().setHours(0, 0, 0, 0) } });

    if (!isLoggedForToday) {
        await FootPrint.create({ telegramId, point });
        await user.addPoints(point);
        SuccessHandler({
            res,
            status: 200,
            message: "Footprint logged"
        });
    }

    SuccessHandler({
        res,
        status: 200,
        message: "Footprint already logged"
    });
});

router.get("/footprint", async (req, res) => {
    const { telegramId } = req.query;
    const user = (await User.findOne({ telegramId, createdAt: { $gte: new Date().setHours(0, 0, 0, 0) } })) as IUser;
    if (!user) {
        SuccessHandler({
            res,
            status: 200,
            message: "Footprint not logged for today",
            data: {
                logged: false
            }
        });
    } else {
        SuccessHandler({
            res,
            status: 200,
            message: "Footprint already logged",
            data: {
                logged: true
            }
        });
    }
});

router.get("/leaderboard", async (req, res) => {
    
    const users = await User.aggregate([
        // Step 1: Add a new field that is the sum of field1 and field2
        {
          $addFields: {
            totalSum: { $add: ["$points", "$bonus"] }
          }
        },
        // Step 2: Sort by the new field totalSum in descending order (or ascending if needed)
        {
          $sort: { totalSum: -1 } // Use 1 for ascending order
        },
        // Optionally, remove the totalSum field if it's not needed in the output
      
      ])

      if (!users) {
        return ErrorHandler({
            res,
            status: 404,
            message: "No users found"
        });
    }
    SuccessHandler({
        res,
        status: 200,
        message: "Users found",
        data: users
    });
});
router.get("/get-referral-leaderboard", async (req, res) => {
    const { referralCode } = req.query;

    if (!referralCode) {
        return ErrorHandler({
            res,
            status: 400,
            message: "Please provide a telegram id"
        });
    }
    
    const users = await User.aggregate([
        // Step 1: Add a new field that is the sum of field1 and field2
        {
            $match: {
                referredBy: referralCode // Find all users referred by this referral code
            }
        },
        { 
            $project: { 
              totalPoints: 1, 
              firstName: 1, 
              _id: 0 // Optionally exclude the _id field
            } 
          },
        // Step 2: Sort by the new field totalSum in descending order (or ascending if needed)
        {
          $sort: { totalPoints: -1 } // Use 1 for ascending order
        },
        // Optionally, remove the totalSum field if it's not needed in the output


        {
            $limit: 100
          },
          // Step 5: Count the total number of users (ignores the limit)
          {
            $facet: {
              totalUsers: [{ $count: "count" }], // Count the total number of users
              users: [{ $limit: 100 }] // Limit the user documents returned
            }}
      
      ])

      if (!users) {
        return ErrorHandler({
            res,
            status: 404,
            message: "No users found"
        });
    }
    SuccessHandler({
        res,
        status: 200,
        message: "Users found",
        data: users
    });
});
// router.get("/leaderboard", async (req, res) => {
//     const users = await User.find().sort({ points: -1, createdAt: 1 });
//     if (!users) {
//         return ErrorHandler({
//             res,
//             status: 404,
//             message: "No users found"
//         });
//     }
//     SuccessHandler({
//         res,
//         status: 200,
//         message: "Users found",
//         data: users
//     });
// });

router.put("/level-up", async (req, res) => {
    const { telegramId, levelIndex, points } = req.body;
    const user = (await User.findOne({ telegramId })) as IUser;
    if (!user) {
        return ErrorHandler({
            res,
            status: 404,
            message: "your account is invalid"
        });
    } else {
        let requiredPoints = points;
        let newLevel = levelIndex;
        let userPoints = user.points;
        if (requiredPoints > userPoints) {
            return ErrorHandler({
                res,
                status: 400,
                message: "Not enough points to level up"
            });
        }
        userPoints -= requiredPoints;
        await User.findOneAndUpdate({ telegramId }, { points: userPoints, level: newLevel });
        SuccessHandler({
            res,
            status: 200,
            message: "You have leveled up"
        });
    }
});

router.get("/referee", async (req, res) => {
    const { telegramId } = req.query;
    const user = (await User.findOne({ telegramId })) as IUser;
    if (!user) {
        return ErrorHandler({
            res,
            status: 404,
            message: "your account is invalid"
        });
    }

    const referrals = await user.getRefereePoints();
    SuccessHandler({
        res,
        status: 200,
        message: "Referees found",
        data: referrals
    });
});

router.put("/add-referee", async (req, res) => {
    const { telegramId, referralCode, fullname } = req.body;
    const user = (await User.findOne({ referralCode })) as IUser;
    const userReferred = (await User.findOne({ telegramId })) as IUser;
    if (!user) {
        return ErrorHandler({
            res,
            status: 404,
            message: "your account is invalid"
        });
    }
    await user.addReferee(telegramId, fullname);
    await userReferred.addReferredBy(referralCode);
    SuccessHandler({
        res,
        status: 200,
        message: "Referee added"
    });
});
router.put("/get-referee-point", async (req, res) => {
    const { referralCode } = req.body;
    const user = (await User.findOne({ referralCode })) as IUser;

    if (!user) {
        return ErrorHandler({
            res,
            status: 404,
            message: "your account is invalid"
        });
    }

    const result = await User.aggregate([
        {
            $match: {
                referredBy: referralCode // Find all users referred by this referral code
            }
        },
        
        {
            $group: {
                _id: null,
                totalEarnings: { $sum: "$totalPoints" } // Sum the earnings of referred users
            }
        },
        {
            $project: {
                _id: 0,
                bonus: { $multiply: ["$totalEarnings", 0.1] } // Calculate 10% of the total earnings
            }
        }
    ]);
    // let bonus:Number = result 

    if (result.length > 0) {
        const bonus = result[0].bonus;
        await user.setBonusPoints(bonus);

    }

    SuccessHandler({
        res,
        status: 200,
        message: "Referee added"
    });
});

router.put("/add-points", async (req, res) => {
    const { telegramId, points } = req.body;
    const user = (await User.findOne({ telegramId })) as IUser;
    if (!user) {
        return ErrorHandler({
            res,
            status: 404,
            message: "your account is invalid"
        });
    }
    await user.addPoints(points);
    SuccessHandler({
        res,
        status: 200,
        message: "Points added"
    });
});

router.put("/deduct-points", async (req, res) => {
    const { telegramId, points } = req.body;
    const user = (await User.findOne({ telegramId })) as IUser;
    if (!user) {
        return ErrorHandler({
            res,
            status: 404,
            message: "your account is invalid"
        });
    }

    await user.deductPoints(points);
    SuccessHandler({
        res,
        status: 200,
        message: "Points deducted"
    });
});

router.get("/tasks", async (req, res) => {
    const { tid } = req.query;
    const user = (await User.findOne({ telegramId: tid })) as IUser;
    if (!user) {
        return ErrorHandler({
            res,
            status: 404,
            message: "your account is invalid"
        });
    }
    const tasks = await user.getTasks();
    SuccessHandler({
        res,
        status: 200,
        message: "Tasks found",
        data: tasks
    });
});

router.put("/claim-task", async (req, res) => {
    const { telegramId, points, taskId } = req.body;
    const user = (await User.findOne({ telegramId })) as IUser;
    if (!user) {
        return ErrorHandler({
            res,
            status: 404,
            message: "your account is invalid"
        });
    }
    await user.claimTask(taskId, points);
    SuccessHandler({
        res,
        status: 200,
        message: "Points claimed"
    });
});

export default router;
