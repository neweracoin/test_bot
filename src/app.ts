import { Context, Telegraf } from 'telegraf';
import { ENV, WelcomeText } from "./utils/constants";


// Function to send a welcome photo
function sendWelcomePhoto(ctx: Context, username: string, url: string) {
    ctx.replyWithPhoto(`${process.env.APP_URL}/${ENV.APP_IMG_NAME}`, {
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

// Main bot setup
export default async (bot: Telegraf<Context>) => {
    // Handle /start command with a parameter
    bot.command('start', async (ctx) => {
        const { id, username, first_name, last_name } = ctx.message.from!;
        const fullname = `${first_name || ''} ${last_name || ''}`;
        let referralCode = 'null';
        let url = `${process.env.APP_URL}/splash-screen?tid=${id}&u=${username}&fn=${fullname}`;

        const match = ctx.message?.text?.match(/\/start (.+)/);
        if (match && match[1]) {
            referralCode = match[1];
            url += `&r=${referralCode}`;
        }

        if (username) {
            sendWelcomePhoto(ctx, username, url);
        }
    });

    // Handle /start command without a parameter
    bot.start(async (ctx) => {
        const { id, username, first_name, last_name } = ctx.message.from!;
        const fullname = `${first_name || ''} ${last_name || ''}`;
        let url = `${process.env.APP_URL}/splash-screen?tid=${id}&u=${username}&fn=${fullname}`;

        if (username) {
            sendWelcomePhoto(ctx, username, url);
        }
    });
};
