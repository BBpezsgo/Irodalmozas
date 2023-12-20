export type BigDate = {
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

export function IsIntervalOverlapped(a: Interval<DateParseable>, b: Interval<DateParseable>, threshold: number) {
    if (Array.isArray(a))
    { a = { start: a[0], end: a[1] } }

    if (Array.isArray(b))
    { b = { start: b[0], end: b[1] } }

    if (a.start > b.start) {
        const temp = a
        a = b
        b = temp
    }

    const dist = (ToDays(a.end) - ToDays(b.start))

    return dist > -threshold

    // console.log(dist)
    // 
    // if ((ToDays(b.start) - threshold) < (ToDays(a.start) + threshold)) {
    //     return (ToDays(b.end) + threshold) > (ToDays(a.start) - threshold)
    // } else {
    //     return (ToDays(b.start) - threshold) < (ToDays(a.end) + threshold)
    // }
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

export function ToDays(date: DateParseable): number {
    date = Parse(date)
    let sign = Math.sign(date.year)
    return (date.year * 365.25) + (date.month * 30 * sign) + (date.day * sign)
}

export function ToString(date: DateParseable) {
    date = Parse(date)
    return `${date.year}. ${{
        1: 'Január',
        2: 'Február',
        3: 'Március',
        4: 'Április',
        5: 'Május',
        6: 'Június',
        7: 'Július',
        8: 'Augusztus',
        9: 'Szeptember',
        10: 'Október',
        11: 'November',
        12: 'December',
    }[date.month]} ${date.day}.`
}

export function FromDays(days: number): BigDate {
    days = Math.abs(days)
    const years = Math.floor(days / 365.25)
    days = days % 365.25
    const months = Math.floor(days / 30.4375)
    days = days % 30.4375
    days = Math.floor(days)

    return {
        year: years,
        month: months,
        day: days,
    }
}
