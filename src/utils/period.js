import { monthKey } from './date.js'

export const PERIOD_TABS = [
    { value: 'month', label: 'Місяць' },
    { value: 'year', label: 'Рік' },
]

/** Ключ періоду для дати YYYY-MM-DD: '2026-11' (місяць) або '2026' (рік). */
export function periodKey(mode, iso) {
    const [y, m] = iso.split('-')
    if (mode === 'year') return y
    return `${y}-${m}`
}

export function currentPeriodKey(mode) {
    return periodKey(mode, `${monthKey()}-01`)
}

export function prevPeriodKey(mode, key) {
    if (mode === 'year') return String(Number(key) - 1)
    const [y, m] = key.split('-').map(Number)
    return monthKey(new Date(y, m - 2, 1))
}

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

/** «Листопад» */
export function monthName(key) {
    return capitalize(
        new Date(`${key}-01T00:00:00`).toLocaleDateString('uk-UA', { month: 'long' })
    )
}

/** «Листопад 2026» */
export function monthLabel(key) {
    return capitalize(
        new Date(`${key}-01T00:00:00`).toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })
    )
}

export function periodLabel(mode, key) {
    if (mode === 'year') return key
    return monthLabel(key)
}