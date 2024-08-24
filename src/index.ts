
import mongoose from "mongoose";
import { ENV } from "./utils/constants";
import botApp from "./app";
import express from "express";
import cors from "cors";
import { Outline } from "./utils/helpers";
import routes from "./routes";
import { Telegraf } from "telegraf";

const app = express();
const PORT = ENV.PORT;
app.use(
    cors({
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        allowedHeaders: "Content-Type,Authorization",
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
routes(app);



const bot = new Telegraf(ENV.TOKEN as string);

(async () => {
    try {
        mongoose
            .connect(ENV.MONGO_DB_URI as string, {
                dbName: ENV.MONGO_DB_NAME,
            })
            .then(() => {
                app.listen(PORT, () => console.log(`Bot Up and Running on ${PORT}`));
                // const urlTo = `https://api.telegram.org/bot${ENV.TOKEN}/deleteWebhook`;
                // fetch(urlTo)
                // .then(response => response.json())
                // .then(data => {
                //     console.log("updatebot", data)
                // })
                // .catch(error => {
                //     console.log('Failed to fetch updates');
                //     console.error('Error fetching updates:', error);
                // });
                botApp(bot);
                bot.launch()
            });
    } catch (error) {
        console.error("Error occurred:", error);
    }
// Enable graceful stop
// process.once('SIGINT', () => bot.stop('SIGINT'))
// process.once('SIGTERM', () => bot.stop('SIGTERM'))
    process.on("unhandledRejection", (err) => {
        console.log(err);
        process.exit(1);
    });

    process.on("uncaughtException", (err) => {
        console.log(err);
        process.exit(1);
    });
})();

if (ENV.NODE_ENV === "development") {
    app.use((req, res, next) => {
        console.log("\n" + Outline("++++++++ ++++++++") + "\n");

        console.log(`${req.method} >> ${req.get("HOST")}${req.originalUrl}`);
        if (["POST", "PUT", "PATCH"].includes(req.method)) console.log(Outline("Request body") + "\n", req.body);
        if (["GET", "DELETE"].includes(req.method) && Object.keys(req.params).length > 0) console.log(Outline("Request params") + "\n", req.params);

        if (req.method === "GET" && Object.keys(req.query).length > 0) console.log(Outline("Request query") + "\n", req.query);

        console.log(Outline("Request Header") + "\n", req.headers);

        console.log("\n" + Outline("------- --------") + "\n");

        next();
    });
}
