export function formatDate(date: Date | string | number): string {
    if (!date) return ""
    const d = new Date(date);

    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(d)
}
export function formatDateTime(date: Date | string | number): string {
    if (!date) return "";
    const d = new Date(date);

    return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(d);
}