export function validateDayString(day: string): boolean {
    if (!day.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return false;
    }

    const date = new Date(day);
    if (isNaN(date.getTime())) {
        return false;
    }
    return true;
}
