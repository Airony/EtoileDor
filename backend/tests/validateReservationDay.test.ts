import { expect, test } from "vitest";
import { validateReservationDay } from "../src/utils/validateReservationDay";

function DayOffsetFromToday(offset: number): string {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString();
}

test("Invalid date format", () => {
    expect(validateReservationDay("")).toBe(false);
    expect(validateReservationDay("T00:01:00")).toBe(false);
    expect(validateReservationDay("2021/10/10")).toBe(false);
});

test("Past date", () => {
    expect(validateReservationDay(DayOffsetFromToday(-1))).toBe(false);
    expect(validateReservationDay(DayOffsetFromToday(0))).toBe(false);
    expect(validateReservationDay(DayOffsetFromToday(1))).toBe(true);

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    expect(validateReservationDay(today.toISOString())).toBe(false);
});

test("Advance days", () => {
    expect(validateReservationDay(DayOffsetFromToday(5))).toBe(true);
    expect(validateReservationDay(DayOffsetFromToday(5), 5)).toBe(true);
    expect(validateReservationDay(DayOffsetFromToday(5), 4)).toBe(false);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    expect(validateReservationDay(tomorrow.toISOString(), 1)).toBe(true);
});
