import { expect, test } from "vitest";
import findAvailableTimeSlots from "../src/utils/findAvailableTimeSlots";
import { Reservation, RestaurantTable } from "../src/payload-types";

function Table(id: string): RestaurantTable {
    return {
        id: id,
        number: 0,
        capacity: 0,
        updatedAt: "",
        createdAt: "",
    };
}

function Reservation(
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
test("No tables", () => {
    expect(findAvailableTimeSlots([], [], 60, [0, 60, 120])).toEqual([]);
});

// One table, no reservations
test("One table, no reservations", () => {
    expect(findAvailableTimeSlots([Table("1")], [], 60, [0, 60, 120])).toEqual([
        0, 60, 120,
    ]);
});

// One table, one reservation
test("One table, one reservation", () => {
    expect(
        findAvailableTimeSlots(
            [Table("1")],
            [Reservation("1", 0, 60, "1")],
            60,
            [0, 60, 120],
        ),
    ).toEqual([60, 120]);
});

// One table, two reservations
test("One table, two reservations", () => {
    expect(
        findAvailableTimeSlots(
            [Table("1")],
            [Reservation("1", 0, 60, "1"), Reservation("2", 120, 180, "1")],
            60,
            [0, 60, 120, 180],
        ),
    ).toEqual([60, 180]);
});

// Two tables, first one filled out
test("Two tables, first one filled out", () => {
    expect(
        findAvailableTimeSlots(
            [Table("1"), Table("2")],
            [Reservation("1", 0, 140, "1")],
            60,
            [0, 60, 120],
        ),
    ).toEqual([0, 60, 120]);
});

// One table, different reservation durations
test("One table, different reservation durations", () => {
    expect(
        findAvailableTimeSlots(
            [Table("1")],
            [Reservation("1", 0, 45, "1"), Reservation("2", 90, 180, "1")],
            30,
            [0, 30, 60, 90, 120, 150],
        ),
    ).toEqual([60]);
});

// Multiple tables with overlapping reservations
test("Multiple tables with overlapping reservations", () => {
    expect(
        findAvailableTimeSlots(
            [Table("1"), Table("2")],
            [
                Reservation("1", 0, 60, "1"),
                Reservation("2", 30, 90, "2"),
                Reservation("3", 60, 120, "1"),
                Reservation("4", 90, 150, "2"),
            ],
            60,
            [0, 60, 120, 180],
        ),
    ).toEqual([120, 180]);
});

// No available times
test("No available times", () => {
    expect(
        findAvailableTimeSlots(
            [Table("1")],
            [Reservation("1", 0, 60, "1"), Reservation("2", 60, 120, "1")],
            60,
            [0, 60],
        ),
    ).toEqual([]);
});

// Edge case with reservations ending exactly at the start of a new time slot
test("Edge case with reservations ending exactly at the start of a new time slot", () => {
    expect(
        findAvailableTimeSlots(
            [Table("1")],
            [Reservation("1", 0, 60, "1")],
            60,
            [0, 60, 120],
        ),
    ).toEqual([60, 120]);
});

// Edge case with reservations starting exactly at the end of a previous time slot
test("Edge case with reservations starting exactly at the end of a previous time slot", () => {
    expect(
        findAvailableTimeSlots(
            [Table("1")],
            [Reservation("1", 60, 120, "1")],
            60,
            [0, 60, 120],
        ),
    ).toEqual([0, 120]);
});
