import { Payload } from "payload";

export async function queryTablesBySize(payload: Payload, partySize: number) {
    // Note: We can also filter out tables that have too high of a capacity so that we don't waste them on small parties
    return (
        await payload.find({
            collection: "restaurant_tables",
            where: {
                capacity: {
                    greater_than_equal: partySize,
                },
            },
        })
    ).docs;
}
