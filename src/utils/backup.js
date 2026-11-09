const APP_ID = 'lessonlog'
const VERSION = 1

export function buildBackup(types, lessons, schedule = []) {
    return JSON.stringify(
        { app: APP_ID, version: VERSION, exportedAt: new Date().toISOString(), types, lessons, schedule },
        null,
        2
    )
}

/** Перевіряє текст файлу й повертає { types, lessons }, або кидає Error з поясненням. */
export function parseBackup(text) {
    let data
    try {
        data = JSON.parse(text)
    } catch {
        throw new Error('Файл не є коректним JSON')
    }
    if (!data || data.app !== APP_ID) throw new Error('Це не файл резервної копії LessonLog')
    if (!Array.isArray(data.types) || !Array.isArray(data.lessons)) {
        throw new Error('У файлі бракує списку типів або уроків')
    }

    const types = data.types
        .filter((t) => t && t.id && t.name)
        .map((t) => ({
            id: String(t.id),
            name: String(t.name),
            price: Number(t.price) || 0,
            duration: Number(t.duration) > 0 ? Number(t.duration) : 1,
        }))

    const lessons = data.lessons
        .filter((l) => l && l.id && /^\d{4}-\d{2}-\d{2}$/.test(l.date) && l.typeId)
        .map((l) => ({
            id: String(l.id),
            date: l.date,
            typeId: String(l.typeId),
            hours: Number(l.hours) || 0,
            note: l.note ? String(l.note) : '',
            ...(l.price !== undefined && l.price !== null ? { price: Number(l.price) || 0 } : {}),
            ...(l.scheduleKey ? { scheduleKey: String(l.scheduleKey) } : {}),
        }))

    // У старих копіях розкладу немає: тоді schedule = null і поточний розклад не чіпаємо
    const schedule = Array.isArray(data.schedule)
        ? data.schedule
            .filter((s) => s && s.id && s.typeId && Number(s.weekday) >= 1 && Number(s.weekday) <= 7)
            .map((s) => ({
                id: String(s.id),
                weekday: Number(s.weekday),
                typeId: String(s.typeId),
                count: Math.min(10, Math.max(1, Math.floor(Number(s.count)) || 1)),
                note: s.note ? String(s.note) : '',
            }))
        : null

    return { types, lessons, schedule }
}

export function downloadText(filename, text) {
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}