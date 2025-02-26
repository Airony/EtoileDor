import { expect, test } from "vitest";
import getFreeTables from "../src/utils/getFreeTables";
import { MockReservation, MockTable } from "./mocks";

// One table, no reservations
test("No tables available", () => {
    expect(getFreeTables([], [], 0, 60)).toEqual([]);
});

// One table, no reservations
test("One table, no reservations", () => {
    expect(getFreeTables([MockTable("1")], [], 0, 60)).toEqual([
        MockTable("1"),
    ]);
});

// One table, one reservation
test("One table, one reservation (unavailable)", () => {
    expect(
        getFreeTables(
            [MockTable("1")],
            [MockReservation("1", 0, 60, "1")],
            0,
            60,
        ),
    ).toEqual([]);
});

test("One table, one reservation (available after)", () => {
    expect(
        getFreeTables(
            [MockTable("1")],
            [MockReservation("1", 0, 60, "1")],
            60,
            60,
        ),
    ).toEqual([MockTable("1")]);
});

test("One table, one reservation (available before)", () => {
    expect(
        getFreeTables(
            [MockTable("1")],
            [MockReservation("1", 45, 90, "1")],
            0,
            25,
        ),
    ).toEqual([MockTable("1")]);
});

// One table, two reservations
test("One table, two reservations", () => {
    expect(
        getFreeTables(
            [MockTable("1")],
            [
                MockReservation("1", 0, 60, "1"),
                MockReservation("2", 120, 180, "1"),
            ],
            60,
            60,
        ),
    ).toEqual([MockTable("1")]);
});

test("One table, two reservations", () => {
    expect(
        getFreeTables(
            [MockTable("1")],
            [
                MockReservation("1", 0, 60, "1"),
                MockReservation("2", 120, 180, "1"),
            ],
            60,
            70,
        ),
    ).toEqual([]);
});

test("Two tables, no reservations", () => {
    expect(getFreeTables([MockTable("1"), MockTable("2")], [], 60, 90)).toEqual(
        [MockTable("1"), MockTable("2")],
    );
});

// Two tables, first one filled out
test("One table, different reservation durations", () => {
    expect(
        getFreeTables(
            [MockTable("1"), MockTable("2")],
            [MockReservation("1", 0, 45, "1")],
            0,
            30,
        ),
    ).toEqual([MockTable("2")]);
});

// Multiple tables with overlapping reservations
test("Multiple tables with overlapping reservations", () => {
    expect(
        getFreeTables(
            [MockTable("1"), MockTable("2")],
            [
                MockReservation("1", 0, 60, "1"),
                MockReservation("2", 30, 90, "2"),
                MockReservation("3", 120, 120, "1"),
                MockReservation("4", 90, 150, "2"),
            ],
            60,
            50,
        ),
    ).toEqual([MockTable("1")]);
});

// All tables fully booked
test("All tables fully booked", () => {
    expect(
        getFreeTables(
            [MockTable("1"), MockTable("2")],
            [
                MockReservation("1", 0, 60, "1"),
                MockReservation("2", 0, 60, "2"),
            ],
            0,
            60,
        ),
    ).toEqual([]);
});
