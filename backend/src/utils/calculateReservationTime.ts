export function calculateReservationTimeMinutes(partySize: number): number {
    return 30 + partySize * 15;
}
