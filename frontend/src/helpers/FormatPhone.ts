export function formatPhone(phone: number): string {
    const phoneStr = phone.toString().padStart(10, '0');
    return phoneStr.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, "$1-$2-$3-$4");
}
