import type { Request, Response, Express } from "express";
import { Result, body, validationResult } from "express-validator";
import payload from "payload";
import { getTimeRange } from "../utils/time";
import { queryTablesBySize } from "../utils/queryTables";
import { validateReservationDay } from "../utils/validateReservationDay";
import { calculateReservationTimeMinutes } from "../utils/calculateReservationTime";
import getFreeTables from "../utils/getFreeTables";
import queryReservationsByDay from "../utils/queryReservationsByDay";
import { validateDayString } from "../utils/validateDayString";

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
            body("f-name").notEmpty(),
            body("l-name").notEmpty(),
            body("phone-number").notEmpty().isNumeric(), // TODO : further validate phone numbers to be algerian phone numbers
            body("day").notEmpty().custom(validateDayString),
            body("time").notEmpty().isNumeric(),
            body("party-size").notEmpty().isNumeric(),
        ],
        reservationRoute,
    );
}
async function reservationRoute(req: Request, res: Response) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    const result: Result = validationResult(req);
    if (!result.isEmpty()) {
        res.status(400);
        return res.send({ errors: result.array() });
    }

    const partySize = parseInt(req.body["party-size"]);
    const time = parseInt(req.body["time"]);
    const day = req.body["day"];

    if (partySize < 1) {
        return res.status(400).json({
            error: `Party size cannot be less than 1.`,
        });
    }

    const {
        reservations_start,
        reservations_end,
        increment_minutes,
        max_party_size,
        max_reservation_advance_days,
    } = await payload.findGlobal({
        slug: "reservations_config",
        depth: 0,
    });

    if (partySize > max_party_size) {
        return res.status(400).json({
            error: `Party size cannot be greater than ${max_party_size}`,
        });
    }
    if (!validateReservationDay(day, max_reservation_advance_days)) {
        return res.status(400).json({
            error: `Invalid reservation day.`,
        });
    }

    const timeRange = getTimeRange(
        reservations_start,
        reservations_end,
        increment_minutes,
    );

    if (!timeRange.includes(time)) {
        return res.status(400).json({
            error: `Invalid reservation time.`,
        });
    }

    const tables = await queryTablesBySize(payload, partySize);
    if (tables.length === 0) {
        return res.status(400).json({
            error: `No tables available at this day and time.`,
        });
    }

    const reservations = await queryReservationsByDay(
        payload,
        day,
        tables.map((table) => table.id),
    );

    console.log(reservations);
    const reservationDuration = calculateReservationTimeMinutes(partySize);

    const freeTables = getFreeTables(
        tables,
        reservations,
        time,
        reservationDuration,
    );

    if (freeTables.length === 0) {
        return res.status(400).json({
            error: `No tables available at this day and time.`,
        });
    }

    const selectedTable = freeTables.reduce((prev, curr) => {
        return prev.capacity < curr.capacity ? prev : curr;
    }, freeTables[0]);

    await payload.create({
        collection: "reservations",
        data: {
            first_name: req.body["f-name"],
            last_name: req.body["l-name"],
            tel: req.body["phone-number"],
            party_size: req.body["party-size"],
            day: req.body["day"],
            start_time: time,
            end_time: time + reservationDuration,
            table: {
                relationTo: "restaurant_tables",
                value: selectedTable.id,
            },
        },
    });
    res.status(200);
    return res.json({ message: "Form submitted successfully" });
}

export default registerReservationRoute;
