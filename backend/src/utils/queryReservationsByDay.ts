import { Payload } from "payload";

/**
 * Queries reservations by a specific day.
 *
 * @param payload - The payload object .
 * @param day - The day for which reservations are to be queried, in ISO8601 string format.
 * @returns A promise that resolves to an array of reservations.
 */
export default async function queryReservationsByDay(
    payload: Payload,
    day: string,
    tableIds: string[],
) {
    return (
        await payload.find({
            collection: "reservations",
            where: {
                day: {
                    equals: day,
                },
                "table.value": {
                    in: tableIds,
                },
            },
        })
    ).docs;
}
