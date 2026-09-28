export function formatDate(value, locale, options = { dateStyle: 'medium' }) {
    if (!value) return '';
    const date = value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value);
    return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatDateTime(value, locale) {
    return formatDate(value, locale, { dateStyle: 'medium', timeStyle: 'short' });
}

export function toIsoDate(date) {
    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return offsetDate.toISOString().slice(0, 10);
}
