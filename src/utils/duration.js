/** Переводить десяткові години (1.5) у { hours: 1, minutes: 30 }. */
export function toHoursAndMinutes(decimalHours) {
  const totalMinutes = Math.round((Number(decimalHours) || 0) * 60)
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  }
}

/** Переводить { hours, minutes } назад у десяткові години (для підрахунків). */
export function toDecimalHours(hours, minutes) {
  return Number(hours || 0) + Number(minutes || 0) / 60
}

/** Форматує десяткові години як "1 год 30 хв" для показу користувачу. */
export function formatDuration(decimalHours) {
  const { hours, minutes } = toHoursAndMinutes(decimalHours)
  if (hours && minutes) return `${hours} год ${minutes} хв`
  if (hours) return `${hours} год`
  if (minutes) return `${minutes} хв`
  return '0 хв'
}
