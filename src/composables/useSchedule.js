import { ref, watch } from 'vue'
import { addDays, toISODate } from '../utils/date.js'

const SLOTS_KEY = 'lessonlog_schedule'
const DISMISSED_KEY = 'lessonlog_schedule_dismissed'

function read(key) {
    try {
        const raw = localStorage.getItem(key)
        if (raw) {
            const data = JSON.parse(raw)
            if (Array.isArray(data)) return data
        }
    } catch (e) {
        console.error('Не вдалося прочитати зі сховища', key, e)
    }
    return []
}

function write(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
        console.error(e)
    }
}

/** Слот: { id, weekday (1=Пн … 7=Нд), typeId, count, note } */
const slots = ref(read(SLOTS_KEY))

/** Ключі «слот@дата», які користувач пропустив («не було»). Старші за 60 днів чистимо. */
const cutoff = toISODate(addDays(new Date(), -60))
const dismissed = ref(read(DISMISSED_KEY).filter((k) => String(k).split('@')[1] >= cutoff))

watch(slots, (v) => write(SLOTS_KEY, v), { deep: true })
watch(dismissed, (v) => write(DISMISSED_KEY, v), { deep: true })

function makeId() {
    return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

function addSlot({ weekday, typeId, count = 1, note = '' }) {
    slots.value.push({
        id: makeId(),
        weekday: Number(weekday),
        typeId,
        count: Math.min(10, Math.max(1, Math.floor(Number(count)) || 1)),
        note: note.trim(),
    })
}

function removeSlot(id) {
    slots.value = slots.value.filter((s) => s.id !== id)
}

function dismiss(key) {
    if (!dismissed.value.includes(key)) dismissed.value.push(key)
}

function replaceSlots(list) {
    slots.value = list
}

function mergeSlots(list) {
    const existing = new Set(slots.value.map((s) => s.id))
    slots.value.push(...list.filter((s) => !existing.has(s.id)))
}

export function useSchedule() {
    return { slots, dismissed, addSlot, removeSlot, dismiss, replaceSlots, mergeSlots }
}