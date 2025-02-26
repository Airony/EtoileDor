import { Reservation, RestaurantTable } from "../src/payload-types";

export function MockTable(id: string): RestaurantTable {
    return {
        id: id,
        number: 0,
        capacity: 0,
        updatedAt: "",
        createdAt: "",
    };
}

export function MockReservation(
    id: string,
    start: number,
    end: number,
    tableId: string,
): Reservation {
    return {
        id: id,
        table: { relationTo: "restaurant_tables", value: tableId },
        start_time: start,
        end_time: end,
        first_name: "",
        last_name: "",
        tel: "",
        day: "",
        party_size: 0,
        updatedAt: "",
        createdAt: "",
    };
}
