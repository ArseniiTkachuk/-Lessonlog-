/** Ключ місяця YYYY-MM за ЛОКАЛЬНИМ часом (toISOString віддає UTC і зсуває місяць). */
export function monthKey(date = new Date()) {
    const m = String(date.getMonth() + 1).padStart(2, '0')
    return `${date.getFullYear()}-${m}`
}

/** Останні `count` місяців у хронологічному порядку, включно з поточним. */
export function lastMonthKeys(count = 6) {
    const now = new Date()
    const keys = []
    for (let i = count - 1; i >= 0; i--) {
        keys.push(monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)))
    }
    return keys
}

/** Date → 'YYYY-MM-DD' за локальним часом. */
export function toISODate(d) {
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${d.getFullYear()}-${m}-${day}`
}

export function addDays(d, n) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

/** Понеділок тижня, до якого належить дата d (тиждень Пн–Нд). */
export function startOfWeek(d = new Date()) {
    return addDays(d, -((d.getDay() + 6) % 7))
}

/** «пн, 9 лист.» */
export function formatDayLabel(iso) {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('uk-UA', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    })
}