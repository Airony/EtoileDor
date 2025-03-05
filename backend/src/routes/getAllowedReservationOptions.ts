import type { Request, Response, Express } from "express";
import payload from "payload";

export default function registerGetAllowedReservationOptionsRoute(
    app: Express,
) {
    const route = "/api/allowedReservationOptions";
    app.options(route, (req: Request, res: Response) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        res.status(200);
        res.shouldKeepAlive = true;
        res.end();
    });
    app.get(route, getAllowedReservationOptions);
}

async function getAllowedReservationOptions(req: Request, res: Response) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    const { max_reservation_advance_days, max_party_size } =
        await payload.findGlobal({
            slug: "reservations_config",
            depth: 0,
        });
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const maxDay = new Date();
    maxDay.setDate(maxDay.getDate() + max_reservation_advance_days);

    return res
        .status(200)
        .json({
            minDay: tomorrow.toISOString().split("T")[0],
            maxDay: maxDay.toISOString().split("T")[0],
            maxPartySize: max_party_size,
        })
        .end();
}
