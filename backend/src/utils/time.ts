/**
 * Returns an array of times in minutes past midnight between the start and end times.
 */
export function getTimeRange(
    startMinutes: number,
    endMinutes: number,
    incrementMinutes: number,
): number[] {
    return Array.from({
        length: (endMinutes - startMinutes) / incrementMinutes + 1,
    }).map((_, index) => startMinutes + index * incrementMinutes);
}

/**
 * Resets the time of a date object to midnight.
 */
export function clearTimeComponent(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function minutesPastMidnightToTimeString(time: number) {
    const hours = Math.floor(time / 60);
    const mins = time % 60;
    return `${hours}:${mins < 10 ? "0" : ""}${mins}`;
}
