import type { Request, Response } from "express";
import payload from "payload";

export default async function getAllowedReservationOptions(
    req: Request,
    res: Response,
) {
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
