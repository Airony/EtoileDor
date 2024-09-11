export function formatPhone(phone: number): string {
    return phone
        .toString()
        .replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, "$1-$2-$3-$4");
}
