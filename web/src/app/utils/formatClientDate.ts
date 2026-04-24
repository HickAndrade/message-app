import { format } from "date-fns";

export function formatClientDate(value: string, pattern: string) {
    return format(new Date(value), pattern);
}
