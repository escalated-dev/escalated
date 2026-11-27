const UNITS = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
];

/**
 * "3 hours ago" in the given locale. Falls back to the ISO date when the
 * runtime has no Intl.RelativeTimeFormat for it.
 */
export function relativeTime(iso, locale = 'en', now = Date.now()) {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return '';
    const seconds = Math.round((then - now) / 1000);
    const abs = Math.abs(seconds);
    try {
        const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
        for (const [unit, size] of UNITS) {
            if (abs >= size) return formatter.format(Math.trunc(seconds / size), unit);
        }
        return formatter.format(0, 'second');
    } catch {
        return new Date(then).toISOString().slice(0, 10);
    }
}

export function shortDate(iso, locale = 'en') {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    try {
        return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
        return date.toISOString().slice(0, 10);
    }
}
