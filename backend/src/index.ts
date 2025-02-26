import express from "express";
import payload from "payload";
import dotenv from "dotenv";
import registerReservationRoute from "./routes/reservationRoute";
import deployRoute from "./routes/deployRoute";
import createRootUser from "./utils/createRootUser";
import { Config } from "./payload-types";
import registerGetReservationTimesRoute from "./routes/getReservationTimesRoute";

declare module "payload" {
    export interface GeneratedTypes extends Config {}
}

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const start = async () => {
    if (!process.env.PAYLOAD_SECRET) {
        throw new Error("No Payload secret provided.");
    }
    await payload.init({
        secret: process.env.PAYLOAD_SECRET,
        express: app,
        onInit: (payload) => {
            console.log("Payload is now running.");
            console.log("Admin URL: ", payload.getAdminURL());
            createRootUser(payload);
        },
    });

    app.use(express.json());

    app.post("/api/deploy", deployRoute);

    registerReservationRoute(app);
    registerGetReservationTimesRoute(app);

    app.listen(PORT, async () => {
        console.log(
            `Express is now listening for incoming connections on port ${PORT}.`,
        );
    });
};

start();
