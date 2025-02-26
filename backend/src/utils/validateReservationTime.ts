export default function validateReservationTime(time: number): boolean {
    const minutesIncrements = 30; // TODO : This should be a globally defined constant
    const reservationTimesStart = 660;
    const reservationTimesEnd = 1260;

    return (
        time >= reservationTimesStart &&
        time <= reservationTimesEnd &&
        time % minutesIncrements === 0
    );
}
