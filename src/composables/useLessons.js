import { ref, watch } from 'vue'
import { useLessonTypes } from './useLessonTypes.js'

// ВАЖЛИВО: якщо у вашому старому файлі ключ інший — залиште старий, щоб не втратити дані!
const STORAGE_KEY = 'lessonlog_lessons'

const { getTypeById } = useLessonTypes()

/**
 * Одноразова міграція: уроки без ціни «заморожуються» за поточною ціною типу.
 * Якщо ціна типу 0 (ще не задана), урок лишається без ціни й рахується за ціною типу.
 */
function withFrozenPrice(list) {
  return list.map((l) => {
    if (l.price !== undefined && l.price !== null) return l
    const price = Number(getTypeById(l.typeId)?.price) || 0
    return price > 0 ? { ...l, price } : l
  })
}

function loadLessons() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return withFrozenPrice(JSON.parse(raw))
  } catch (e) {
    console.error('Не вдалося прочитати уроки зі сховища', e)
  }
  return []
}

const lessons = ref(loadLessons())

// зберегти результат міграції одразу
try {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons.value))
} catch (e) {
  console.error(e)
}

watch(
    lessons,
    (value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    },
    { deep: true }
)

function makeId() {
  return `l_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

/** Сьогоднішня дата у форматі YYYY-MM-DD (за локальним часом). */
function todayISO() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** Додає `count` однакових уроків (кожен — окремий запис зі своїм id). */
function addLessons({ date, typeId, hours, note = '', price = 0, scheduleKey }, count = 1) {
  const n = Math.max(1, Math.floor(Number(count)) || 1)
  for (let i = 0; i < n; i++) {
    lessons.value.push({
      id: makeId(),
      date,
      typeId,
      hours: Number(hours),
      note,
      price: Number(price) || 0,
      ...(scheduleKey ? { scheduleKey } : {}), // позначка «створено з розкладу»
    })
  }
}

/** Ціна уроку: збережена в уроці, а для старих без ціни — поточна ціна типу. */
function lessonPrice(lesson) {
  if (lesson.price !== undefined && lesson.price !== null) return Number(lesson.price) || 0
  return Number(getTypeById(lesson.typeId)?.price) || 0
}

function addLesson(data) {
  addLessons(data, 1)
}

function updateLesson(id, changes) {
  const lesson = lessons.value.find((l) => l.id === id)
  if (lesson) Object.assign(lesson, changes)
}

function removeLesson(id) {
  lessons.value = lessons.value.filter((l) => l.id !== id)
}

function sortedLessons() {
  return [...lessons.value].sort((a, b) => b.date.localeCompare(a.date))
}

/** Імпорт: повністю замінює всі уроки. */
function replaceLessons(list) {
  lessons.value = list
}

/** Імпорт: додає лише ті уроки, яких ще немає (за id). Повертає кількість доданих. */
function mergeLessons(list) {
  const existing = new Set(lessons.value.map((l) => l.id))
  const fresh = list.filter((l) => !existing.has(l.id))
  lessons.value.push(...fresh)
  return fresh.length
}

export function useLessons() {
  return {
    lessons,
    addLesson,
    addLessons,
    updateLesson,
    removeLesson,
    lessonPrice,
    sortedLessons,
    todayISO,
    replaceLessons,
    mergeLessons,
  }
}