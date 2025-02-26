export default function validateReservationTime(
    time: number,
    minutesIncrements: number,
    reservationTimesStart: number,
    reservationTimesEnd: number,
): boolean {
    return (
        time >= reservationTimesStart &&
        time <= reservationTimesEnd &&
        time % minutesIncrements === 0
    );
}
