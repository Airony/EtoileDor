import findAvailableTimeSlots from "../utils/findAvailableTimeSlots";
import { type Request, type Response, type Express } from "express";
import { Result, query, validationResult } from "express-validator";
import { dateTimeToMinutesPastMidnight, getTimeRange } from "../utils/time";
import { queryTablesBySize } from "../utils/queryTables";
import queryReservationsByDay from "../utils/queryReservationsByDay";
import { calculateReservationTimeMinutes } from "../utils/calculateReservationTime";
import { validateReservationDay } from "../utils/validateReservationDay";
import payload from "payload";
import { validateDayString } from "../utils/validateDayString";

export default function registerGetReservationTimesRoute(app: Express) {
    const route = "/api/reservationTimes";
    app.options(route, (req: Request, res: Response) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        res.status(200);
        res.shouldKeepAlive = true;
        res.end();
    });
    app.get(
        route,
        [
            query("day").exists().notEmpty().custom(validateDayString),
            query("party-size").exists().notEmpty().isNumeric(),
        ],
        getReservationTimesRoute,
    );
}

async function getReservationTimesRoute(req: Request, res: Response) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    const validationRes: Result = validationResult(req);
    if (!validationRes.isEmpty()) {
        res.status(400);
        return res.send({ errors: validationRes.array() });
    }

    const day = req.query.day as string;
    const partySize = parseInt(req.query["party-size"] as string);

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

    if (partySize < 1) {
        return res.status(400).json({
            error: `Party size cannot be less than 1.`,
        });
    }

    if (partySize > max_party_size) {
        return res.status(400).json({
            error: `Party size cannot be greater than ${max_party_size}`,
        });
    }

    if (
        !validateReservationDay(day, max_reservation_advance_days || undefined)
    ) {
        return res.status(400).json({
            error: `Invalid reservation day.`,
        });
    }

    const reservationsStartMinutes =
        dateTimeToMinutesPastMidnight(reservations_start);
    const reservationsEndMinutes =
        dateTimeToMinutesPastMidnight(reservations_end);

    const reservationDuration = calculateReservationTimeMinutes(partySize);
    const timeRange = getTimeRange(
        reservationsStartMinutes,
        reservationsEndMinutes,
        increment_minutes,
    );

    const tables = await queryTablesBySize(payload, partySize);
    const tableIds = tables.map((table) => table.id);
    const reservations = await queryReservationsByDay(payload, day, tableIds);

    const freeTimes = findAvailableTimeSlots(
        tables,
        reservations,
        reservationDuration,
        timeRange,
    );

    return res.status(200).json(freeTimes).end();
}
