import { formatDuration } from './duration.js'
import { monthName } from './period.js'

export const REPORT_KINDS = [
    {
        value: 'full',
        label: 'Повний (з усіма датами)',
        description: 'Кожен урок з датою, типом, тривалістю, ціною й нотаткою, плюс усі підсумки.',
    },
    {
        value: 'short',
        label: 'Короткий: типи та кількість',
        description: 'Лише тип уроку й скільки разів його проведено.',
    },
    {
        value: 'nodates',
        label: 'Без дат (усе інше)',
        description: 'Усе, окрім дат: однакові уроки зведені в один рядок із кількістю, плюс підсумки.',
    },
    {
        value: 'days',
        label: 'По днях',
        description: 'Компактний календар: дата й що відбулося в цей день.',
    },
    {
        value: 'notes',
        label: 'По нотатках (учнях)',
        description: 'Групування за нотаткою: скільки уроків, годин і грошей на кожну.',
    },
    {
        value: 'invoice',
        label: 'Рахунок (до сплати)',
        description: 'Тип × ціна = сума та загальна сума до сплати.',
    },
]

// ---------- допоміжне ----------
const money = (n) => `${Math.round(n).toLocaleString('uk-UA')} ₴`
const dur = (h) => formatDuration(h)

function fmtDate(iso) {
    const [y, m, d] = iso.split('-')
    return `${d}.${m}.${y}`
}

function weekday(iso) {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('uk-UA', { weekday: 'short' })
}

function sortByDate(list) {
    return [...list].sort((a, b) => a.date.localeCompare(b.date))
}

function summarize(list, price) {
    const count = list.length
    const hours = list.reduce((s, l) => s + (Number(l.hours) || 0), 0)
    const earnings = list.reduce((s, l) => s + price(l), 0)
    return {
        count,
        hours,
        earnings,
        perHour: hours > 0 ? earnings / hours : 0,
        avg: count > 0 ? earnings / count : 0,
    }
}

function typeName(types, id) {
    return types.find((t) => t.id === id)?.name ?? 'Видалений тип'
}

/** Групи за типом у порядку типів із налаштувань; уроки видалених типів — в кінці. */
function groupByType(list, types) {
    const groups = types.map((t) => ({
        id: t.id,
        name: t.name,
        lessons: list.filter((l) => l.typeId === t.id),
    }))
    const known = new Set(types.map((t) => t.id))
    const orphans = list.filter((l) => !known.has(l.typeId))
    if (orphans.length) groups.push({ id: '?', name: 'Видалений тип', lessons: orphans })
    return groups.filter((g) => g.lessons.length)
}

function statsLine(s) {
    let text = `${s.count} ур. · ${dur(s.hours)}`
    if (s.earnings > 0) {
        text += ` · ${money(s.earnings)} · сер. ${money(s.avg)}`
        if (s.hours > 0) text += ` · ${money(s.perHour)}/год`
    }
    return text
}

function totalsLines(s) {
    const lines = [`Уроків: ${s.count}`, `Час: ${dur(s.hours)}`]
    if (s.earnings > 0) {
        lines.push(`Заробіток: ${money(s.earnings)}`, `Середній урок: ${money(s.avg)}`)
        if (s.hours > 0) lines.push(`За годину: ${money(s.perHour)}/год`)
    }
    return lines
}

function typeSummaryLines(groups, price) {
    return groups.map((g) => `• ${g.name} — ${statsLine(summarize(g.lessons, price))}`)
}

function monthLines(list, price) {
    const byMonth = new Map()
    for (const l of list) {
        const key = l.date.slice(0, 7)
        if (!byMonth.has(key)) byMonth.set(key, [])
        byMonth.get(key).push(l)
    }
    return [...byMonth.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, items]) => `• ${monthName(key)} — ${statsLine(summarize(items, price))}`)
}

function lessonSuffix(l, price) {
    const p = price(l)
    return (p > 0 ? ` — ${money(p)}` : '') + (l.note ? ` — «${l.note}»` : '')
}

// ---------- окремі звіти ----------
function fullReport(ctx, groups) {
    const { lessons, types, price } = ctx
    const lines = [`ПОВНИЙ ЗВІТ — ${ctx.label}`, '', ...totalsLines(summarize(lessons, price)), '', 'УРОКИ']
    sortByDate(lessons).forEach((l, i) => {
        lines.push(
            `${i + 1}. ${fmtDate(l.date)} (${weekday(l.date)}) — ${typeName(types, l.typeId)} — ${dur(l.hours)}` +
            lessonSuffix(l, price)
        )
    })
    lines.push('', 'ПІДСУМОК ЗА ТИПАМИ', ...typeSummaryLines(groups, price))
    if (ctx.mode === 'year') lines.push('', 'ПО МІСЯЦЯХ', ...monthLines(lessons, price))
    if (ctx.comparison) lines.push('', ctx.comparison)
    return lines
}

function shortReport(ctx, groups) {
    const lines = [`ЗВІТ — ${ctx.label}`, 'Проведено уроків за типами:', '']
    for (const g of groups) lines.push(`• ${g.name} — ${g.lessons.length}`)
    lines.push('', `Разом — ${ctx.lessons.length}`)
    return lines
}

function noDatesReport(ctx, groups) {
    const { lessons, price } = ctx
    const lines = [`ЗВІТ БЕЗ ДАТ — ${ctx.label}`, '', ...totalsLines(summarize(lessons, price)), '', 'УРОКИ']

    for (const g of groups) {
        lines.push('', g.name)
        // однакові уроки (тривалість, ціна, нотатка) зводимо в один рядок
        const same = new Map()
        for (const l of g.lessons) {
            const key = `${l.hours}|${price(l)}|${l.note ?? ''}`
            if (!same.has(key)) same.set(key, { lesson: l, n: 0 })
            same.get(key).n += 1
        }
        for (const { lesson, n } of same.values()) {
            lines.push(`  • ${dur(lesson.hours)}${lessonSuffix(lesson, price)}${n > 1 ? ` × ${n}` : ''}`)
        }
    }

    lines.push('', 'ПІДСУМОК ЗА ТИПАМИ', ...typeSummaryLines(groups, price))
    if (ctx.mode === 'year') lines.push('', 'ПО МІСЯЦЯХ', ...monthLines(lessons, price))
    if (ctx.comparison) lines.push('', ctx.comparison)
    return lines
}

function daysReport(ctx) {
    const { lessons, types } = ctx
    const byDate = new Map()
    for (const l of sortByDate(lessons)) {
        if (!byDate.has(l.date)) byDate.set(l.date, [])
        byDate.get(l.date).push(l)
    }
    const lines = [`ЗВІТ ПО ДНЯХ — ${ctx.label}`, '']
    for (const [date, list] of byDate) {
        const counts = new Map()
        for (const l of list) {
            const name = typeName(types, l.typeId)
            counts.set(name, (counts.get(name) ?? 0) + 1)
        }
        const what = [...counts].map(([name, n]) => (n > 1 ? `${name} × ${n}` : name)).join(', ')
        lines.push(`${fmtDate(date)} (${weekday(date)}) — ${what}`)
    }
    lines.push('', `Днів з уроками: ${byDate.size}`, `Уроків: ${lessons.length}`)
    return lines
}

function notesReport(ctx) {
    const { lessons, price } = ctx
    const groups = new Map()
    for (const l of lessons) {
        const raw = (l.note ?? '').trim()
        const key = raw.toLowerCase()
        if (!groups.has(key)) groups.set(key, { name: raw || 'Без нотатки', list: [] })
        groups.get(key).list.push(l)
    }
    const rows = [...groups.values()].sort((a, b) => b.list.length - a.list.length)
    return [
        `ЗВІТ ПО НОТАТКАХ — ${ctx.label}`,
        '',
        ...rows.map((g) => `• ${g.name} — ${statsLine(summarize(g.list, price))}`),
        '',
        `Разом — ${statsLine(summarize(lessons, price))}`,
    ]
}

function invoiceReport(ctx) {
    const { lessons, types, price } = ctx
    const rows = new Map() // тип + ціна
    for (const l of lessons) {
        const p = price(l)
        const key = `${l.typeId}|${p}`
        if (!rows.has(key)) rows.set(key, { typeId: l.typeId, price: p, n: 0 })
        rows.get(key).n += 1
    }
    const order = types.map((t) => t.id)
    const pos = (id) => (order.includes(id) ? order.indexOf(id) : order.length) // видалені типи — в кінець
    const sorted = [...rows.values()].sort((a, b) => pos(a.typeId) - pos(b.typeId) || b.price - a.price)

    const lines = [`РАХУНОК — ${ctx.label}`, '']
    for (const r of sorted) {
        const name = typeName(types, r.typeId)
        lines.push(
            r.price > 0
                ? `${name}: ${r.n} × ${money(r.price)} = ${money(r.n * r.price)}`
                : `${name}: ${r.n} ур. — ціну не задано`
        )
    }
    const total = summarize(lessons, price)
    lines.push('', `Разом уроків: ${total.count} (${dur(total.hours)})`, `До сплати: ${money(total.earnings)}`)
    return lines
}

/**
 * ctx: { mode, label, lessons, types, price(lesson), comparison }
 * Повертає готовий текст звіту.
 */
export function buildReport(kind, ctx) {
    if (!ctx.lessons.length) {
        return `ЗВІТ — ${ctx.label}\n\nУ цьому періоді уроків немає.`
    }
    const groups = groupByType(ctx.lessons, ctx.types)
    const builders = {
        full: () => fullReport(ctx, groups),
        short: () => shortReport(ctx, groups),
        nodates: () => noDatesReport(ctx, groups),
        days: () => daysReport(ctx),
        notes: () => notesReport(ctx),
        invoice: () => invoiceReport(ctx),
    }
    return (builders[kind] ?? builders.full)().join('\n')
}