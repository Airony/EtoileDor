/**
|  * Function to validate a reservation day
|  * @param day - The day to validate, in ISO8601 string format.
|  * @param maxAdvanceDays - Maximum number of days in the future that a reservation can be made (optional).
|  * @returns A boolean indicating whether the day is valid.
|  */
export function validateReservationDay(
    day: string,
    maxAdvanceDays?: number,
): boolean {
    const date = new Date(day);
    date.setHours(0, 0, 0, 0);

    if (isNaN(date.getTime())) {
        return false;
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (date.getTime() <= now.getTime()) {
        return false;
    }

    if (maxAdvanceDays) {
        const maxDay = new Date();
        maxDay.setDate(maxDay.getDate() + maxAdvanceDays);
        maxDay.setHours(0, 0, 0, 0);
        if (date.getTime() > maxDay.getTime()) {
            return false;
        }
    }

    return true;
}
