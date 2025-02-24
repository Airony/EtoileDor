export default function validateReservationTime(time: number): boolean {
    // Suppose reservations start at 11 am and end at 9 pm
    // In 15 minute intervals
    // Time should be in military time
    // Todo : Have start and end times be configurable
    if (time < 1100 || time > 2100) {
        return false;
    }

    if (time % 15 !== 0) {
        return false;
    }
}
