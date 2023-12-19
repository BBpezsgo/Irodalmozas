export type BigDate = {
    /** **Can be negative** */
    year: number,
    /** **1-based** */
    month: number,
    /** **1-based** */
    day: number,
}

export type BigDateString = `${number}-${number}-${number}`

export type Interval<T> = {
    start: T
    end: T
} | [T, T]

export type DateParseable = string | BigDateString | number | Date | BigDate

export function Min(a: BigDate, b: BigDate) {
    if (a.year < b.year) { return a }
    if (a.year > b.year) { return b }
    if (a.month < b.month) { return a }
    if (a.month > b.month) { return b }
    if (a.day < b.day) { return a }
    if (a.day > b.day) { return b }
    return a
}
export function Max(a: BigDate, b: BigDate) {
    if (a.year < b.year) { return b }
    if (a.year > b.year) { return a }
    if (a.month < b.month) { return b }
    if (a.month > b.month) { return a }
    if (a.day < b.day) { return b }
    if (a.day > b.day) { return a }
    return b
}

export function IsIntervalOverlapped(a: Interval<DateParseable>, b: Interval<DateParseable>) {
    if (Array.isArray(a))
    { a = { start: a[0], end: a[1] } }

    if (Array.isArray(b))
    { b = { start: b[0], end: b[1] } }

    if (ToDays(b.start) < ToDays(a.start)) {
        return ToDays(b.end) > ToDays(a.start)
    } else {
        return ToDays(b.start) < ToDays(a.end)
    }
}

export function Parse(value: DateParseable): BigDate {
    if (typeof value === 'string') {
        return Parse(new Date(Date.parse(value)))
    } else if (typeof value === 'number') {
        return Parse(new Date(value))
    } else if (value instanceof Date) {
        return {
            year: value.getFullYear(),
            month: value.getMonth() + 1,
            day: value.getDate(),
        }
    } else {
        return value
    }
}

/** **Can be negative** */
export function ToDays(date: DateParseable): number {
    date = Parse(date)
    let sign = Math.sign(date.year)
    return (date.year * 365.25) + (date.month * 30 * sign) + (date.day * sign)
}
