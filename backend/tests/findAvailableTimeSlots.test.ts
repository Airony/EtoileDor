import { expect, test } from "vitest";
import findAvailableTimeSlots from "../src/utils/findAvailableTimeSlots";
import { MockReservation, MockTable } from "./mocks";

test("No tables", () => {
    expect(findAvailableTimeSlots([], [], 60, [0, 60, 120])).toEqual([]);
});

// One table, no reservations
test("One table, no reservations", () => {
    expect(
        findAvailableTimeSlots([MockTable("1")], [], 60, [0, 60, 120]),
    ).toEqual([0, 60, 120]);
});

// One table, one reservation
test("One table, one reservation", () => {
    expect(
        findAvailableTimeSlots(
            [MockTable("1")],
            [MockReservation("1", 0, 60, "1")],
            60,
            [0, 60, 120],
        ),
    ).toEqual([60, 120]);
});

// One table, two reservations
test("One table, two reservations", () => {
    expect(
        findAvailableTimeSlots(
            [MockTable("1")],
            [
                MockReservation("1", 0, 60, "1"),
                MockReservation("2", 120, 180, "1"),
            ],
            60,
            [0, 60, 120, 180],
        ),
    ).toEqual([60, 180]);
});

// Two tables, first one filled out
test("Two tables, first one filled out", () => {
    expect(
        findAvailableTimeSlots(
            [MockTable("1"), MockTable("2")],
            [MockReservation("1", 0, 140, "1")],
            60,
            [0, 60, 120],
        ),
    ).toEqual([0, 60, 120]);
});

// One table, different reservation durations
test("One table, different reservation durations", () => {
    expect(
        findAvailableTimeSlots(
            [MockTable("1")],
            [
                MockReservation("1", 0, 45, "1"),
                MockReservation("2", 90, 180, "1"),
            ],
            30,
            [0, 30, 60, 90, 120, 150],
        ),
    ).toEqual([60]);
});

// Multiple tables with overlapping reservations
test("Multiple tables with overlapping reservations", () => {
    expect(
        findAvailableTimeSlots(
            [MockTable("1"), MockTable("2")],
            [
                MockReservation("1", 0, 60, "1"),
                MockReservation("2", 30, 90, "2"),
                MockReservation("3", 60, 120, "1"),
                MockReservation("4", 90, 150, "2"),
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
            [MockTable("1")],
            [
                MockReservation("1", 0, 60, "1"),
                MockReservation("2", 60, 120, "1"),
            ],
            60,
            [0, 60],
        ),
    ).toEqual([]);
});

// Edge case with reservations ending exactly at the start of a new time slot
test("Edge case with reservations ending exactly at the start of a new time slot", () => {
    expect(
        findAvailableTimeSlots(
            [MockTable("1")],
            [MockReservation("1", 0, 60, "1")],
            60,
            [0, 60, 120],
        ),
    ).toEqual([60, 120]);
});

// Edge case with reservations starting exactly at the end of a previous time slot
test("Edge case with reservations starting exactly at the end of a previous time slot", () => {
    expect(
        findAvailableTimeSlots(
            [MockTable("1")],
            [MockReservation("1", 60, 120, "1")],
            60,
            [0, 60, 120],
        ),
    ).toEqual([0, 120]);
});
