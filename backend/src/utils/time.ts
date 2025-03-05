/**
 * Converts a date string to the number of minutes past midnight.
 * @param {string} date - The ISO8601 date string to convert.
 * @returns {number} The number of minutes past midnight.
 */
export function dateTimeToMinutesPastMidnight(date: string): number {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
        throw new Error("Invalid date string");
    }
    return dateObj.getHours() * 60 + dateObj.getMinutes();
}

/**
 * Returns an array of times in minutes past midnight between the start and end times.
 */
export function getTimeRange(
    startMinutes: number,
    endMinutes: number,
    incrementMinutes: number,
): number[] {
    return Array.from({
        length: (endMinutes - startMinutes) / incrementMinutes,
    }).map((_, index) => startMinutes + index * incrementMinutes);
}

/**
 * Resets the time of a date object to midnight.
 */
export function clearTimeComponent(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
