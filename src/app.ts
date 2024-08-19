import TelegramBot from "node-telegram-bot-api";
import Users from "./model/user";
import { ENV, WelcomeText } from "./utils/constants";

function sendWelcomePhoto(bot: TelegramBot, chatId: number, username: string, url: string) {
    bot.sendPhoto(chatId, `${ENV.APP_URL}/${ENV.APP_IMG_NAME}`, {
        caption: WelcomeText(username),
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Open portal",
                        web_app: {
                            url,
                        },
                    },
                ],
            ],
        },
    });
}

export default async (bot: TelegramBot) => {
    bot.onText(/\/start (.+)/, async (msg, match) => {
        let { id, username, first_name, last_name } = msg.chat as TelegramBot.Chat;
        const fullname = `${first_name || ""} ${last_name || ""}`;
        let referralCode = "null";
        let url = process.env.APP_URL + "/splash-screen?tid=" + id + "&u=" + username + "&fn=" + fullname;
        if (match && !!match[1]) {
            referralCode = match[1];
            url += "&r=" + referralCode;
        }

        if (username) {
            sendWelcomePhoto(bot, msg.chat.id, username, url);
        }
    });

    bot.onText(/^\/start$/, async (msg) => {
        const { id, username, first_name, last_name } = msg.chat as TelegramBot.Chat;
        const fullname = `${first_name || ""} ${last_name || ""}`;
        let url = process.env.APP_URL + "/splash-screen?tid=" + id + "&u=" + username + "&fn=" + fullname;

        if (username) {
            sendWelcomePhoto(bot, msg.chat.id, username, url);
        }
    });
   
};
