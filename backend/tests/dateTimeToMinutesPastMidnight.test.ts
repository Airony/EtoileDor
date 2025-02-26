import { expect, test } from "vitest";
import { dateTimeToMinutesPastMidnight } from "../src/utils/time";

test("dateTimeToMinutesPastMidnight", () => {
    expect(dateTimeToMinutesPastMidnight("2021-10-10T00:00:00")).toEqual(0);
    // More tests here
    expect(dateTimeToMinutesPastMidnight("2021-10-10T00:01:00")).toEqual(1);
    expect(dateTimeToMinutesPastMidnight("2021-10-10T00:59:00")).toEqual(59);
    expect(dateTimeToMinutesPastMidnight("2021-10-10T01:00:00")).toEqual(60);
    expect(dateTimeToMinutesPastMidnight("2021-10-10T01:01:00")).toEqual(61);
    expect(dateTimeToMinutesPastMidnight("2021-10-10T01:59:00")).toEqual(119);
    expect(dateTimeToMinutesPastMidnight("2021-10-10T23:59:00")).toEqual(1439);

    expect(dateTimeToMinutesPastMidnight("2010-01-26T00:01:00")).toEqual(1);
    expect(dateTimeToMinutesPastMidnight("2002-11-22T00:59:00")).toEqual(59);
    expect(dateTimeToMinutesPastMidnight("2004-06-16T01:00:00")).toEqual(60);
    expect(dateTimeToMinutesPastMidnight("2053-03-12T01:01:00")).toEqual(61);
    expect(dateTimeToMinutesPastMidnight("2034-09-01T01:59:00")).toEqual(119);
    expect(dateTimeToMinutesPastMidnight("2015-12-18T23:59:00")).toEqual(1439);

    expect(() =>
        dateTimeToMinutesPastMidnight("2010/01/26T00:01:00"),
    ).toThrowError();
    expect(() => dateTimeToMinutesPastMidnight("")).toThrowError();
    expect(() => dateTimeToMinutesPastMidnight("T00:01:00")).toThrowError();
});
