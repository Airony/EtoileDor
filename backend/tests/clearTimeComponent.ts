import { expect, test } from "vitest";
import { clearTimeComponent } from "../src/utils/time";

test("clearDateTime", () => {
    expect(clearTimeComponent(new Date("2021-10-10T00:00:00"))).toEqual(
        new Date("2021-10-10T00:00:00"),
    );
    expect(clearTimeComponent(new Date("2021-10-10T23:59:59"))).toEqual(
        new Date("2021-10-10T00:00:00"),
    );
});
