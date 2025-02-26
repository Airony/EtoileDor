import { Reservation, RestaurantTable } from "../payload-types";

export default function getFreeTables(
    tables: RestaurantTable[],
    reservations: Reservation[],
    startTime: number,
    reservationDuration: number,
): RestaurantTable[] {
    if (!tables || tables.length === 0) {
        return [];
    }
    const endTime = startTime + reservationDuration;

    const unAvailableTablesSet = new Set<string>();

    reservations.forEach((reservation) => {
        const tableId = reservation.table.value as string;
        if (unAvailableTablesSet.has(tableId)) {
            return;
        }
        const intersects = !(
            endTime <= reservation.start_time ||
            reservation.end_time <= startTime
        );
        if (intersects) {
            unAvailableTablesSet.add(tableId);
        }
    });

    return tables.filter((table) => !unAvailableTablesSet.has(table.id));
}
