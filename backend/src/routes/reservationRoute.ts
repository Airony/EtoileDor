import type { Request, Response, Express } from "express";
import { Result, body, validationResult } from "express-validator";
import payload from "payload";
import { PartySizeOptions, TimeOptions } from "shared";

function registerReservationRoute(app: Express) {
    app.options("/api/reservation", (req: Request, res: Response) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.status(200);
        res.shouldKeepAlive = true;
        res.end();
    });
    app.post(
        "/api/reservation",
        [
            body("l-name").notEmpty(),
            body("phone-number").notEmpty().isNumeric(), // TODO : further validate phone numbers to be algerian phone numbers
            body("date").notEmpty().isDate(), // TODO: further validate the date
            body("time")
                .notEmpty()
                .isIn(TimeOptions.map((opt) => opt.value)),
            body("party-size")
                .notEmpty()
                .isIn(PartySizeOptions.map((opt) => opt.value)),
        ],
        reservationRoute,
    );
}
function reservationRoute(req: Request, res: Response) {
    const result: Result = validationResult(req);
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (result.isEmpty()) {
        payload.create({
            collection: "reservations",
            data: {
                first_name: req.body["f-name"],
                last_name: req.body["l-name"],
                tel: req.body["phone-number"],
                party_size: req.body["party-size"],
                date: constructDate(
                    req.body.date,
                    req.body.time,
                ).toDateString(),
            },
        });
        res.status(200);
        return res.end("Form submitted successfully");
    }
    res.status(400);
    res.send({ errors: result.array() });
}

function constructDate(date: string, time: string): Date {
    const result: Date = new Date(date);
    const [hours, minutes] = time.split(":", 2);
    result.setHours(parseInt(hours), parseInt(minutes));
    return result;
}

export default registerReservationRoute;
