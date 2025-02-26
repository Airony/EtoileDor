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
