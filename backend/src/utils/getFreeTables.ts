import { Payload } from "payload";
import { calculateReservationTimeMinutes } from "./calculateReservationTime";
import { RestaurantTable } from "../payload-types";

export default async function getFreeTables(
    payload: Payload,
    partySize: number,
    day: string,
    time: number,
): Promise<RestaurantTable[]> {
    const endTime = calculateReservationTimeMinutes(partySize) + time;

    const tables = (
        await payload.find({
            collection: "restaurant_tables",
            where: {
                capacity: {
                    greater_than_equal: partySize,
                },
            },
        })
    ).docs;

    if (!tables) {
        return [];
    }
    const tableIds = tables.map((table) => table.id);

    const reservations = (
        await payload.find({
            collection: "reservations",
            depth: 0,
            where: {
                table: {
                    in: tableIds,
                },
                day: {
                    equals: day,
                },
            },
        })
    ).docs;

    const unAvailableTablesSet = new Set<string>();

    reservations.forEach((reservation) => {
        const tableId = reservation.table.value as string;
        if (unAvailableTablesSet.has(tableId)) {
            return;
        }
        const intersects = !(
            endTime < reservation.start_time || reservation.end_time < time
        );
        if (intersects) {
            unAvailableTablesSet.add(tableId);
        }
    });

    return tables.filter((table) => !unAvailableTablesSet.has(table.id));
}
