import dotenv from "dotenv";
dotenv.config();

export const ENV = {
    TOKEN: process.env.TOKEN as string,
    MONGO_DB_URI: process.env.MONGO_DB_URI as string,
    MONGO_DB_NAME: process.env.MONGO_DB_NAME,
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    APP_URL: process.env.APP_URL,
    APP_IMG_NAME: process.env.APP_IMG_NAME,
};

export class ErrorType extends Error {
    statusCode: number;

    constructor(message: string, name: string, statusCode: number) {
        super(message);
        this.name = name;
        this.statusCode = statusCode;
    }
}

export const WelcomeText = (username: string) => `Hey,  @${username} \nWelcome to AiDog\n\nAiDog portal is open for Dog lovers to have fun and earn.\n
Invite family and friends to earn more .\n\n\n`;
