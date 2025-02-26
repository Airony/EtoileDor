import { Reservation, RestaurantTable } from "../payload-types";

// Given a list of times (in minutes past midnight format), Return a subset of the list where a reservation could be made
export default function findAvailableTimeSlots(
    tables: RestaurantTable[],
    reservations: Reservation[],
    durationMinutes: number,
    times: number[],
): number[] {
    if (!tables || tables.length === 0) {
        return [];
    }

    // Create a map of reservations for each table
    const reservationsMap = new Map<string, Reservation[]>();
    tables.forEach((table) => {
        reservationsMap.set(
            table.id,
            reservations.filter(
                (reservation) => reservation.table.value === table.id,
            ),
        );
    });

    const freeTimes = times.filter((time) => {
        return tables.some((table) => {
            const tableReservations = reservationsMap.get(table.id) || [];
            return tableReservations.every((reservation) => {
                return (
                    time + durationMinutes <= reservation.start_time ||
                    reservation.end_time <= time
                );
            });
        });
    });

    return freeTimes;
}
