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