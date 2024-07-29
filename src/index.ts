import TelegramBot from "node-telegram-bot-api";
import mongoose from "mongoose";
import { ENV } from "./utils/constants";
import botApp from "./app";
import express from "express";
import cors from "cors";
import { Outline } from "./utils/helpers";
import routes from "./routes";

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

const bot = new TelegramBot(ENV.TOKEN as string, { polling: true });

(async () => {
    try {
        mongoose
            .connect(ENV.MONGO_DB_URI as string, {
                dbName: ENV.MONGO_DB_NAME,
            })
            .then(() => {
                app.listen(PORT, () => console.log(`Bot Up and Running on ${PORT}`));
                botApp(bot);
            });
    } catch (error) {
        console.error("Error occurred:", error);
    }

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
